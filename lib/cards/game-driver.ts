import { InvalidError } from './invalid-error';
import { Hand } from './hand';
import { Handler } from './handlers/handler';
import { GameState } from './game-state';
import { EndRoundMessage } from './messages/end-round-message';
import { Message } from './messages/message';
import { StartRoundMessage } from './messages/start-round-message';
import { PickupMessage } from './messages/pickup-message';
import { ReshuffleMessage } from './messages/reshuffle-message';
import { DiscardMessage } from './messages/discard-message';
import { PlayedMessage } from './messages/played-message';
import { zip } from './util/zip';
import { GameParams } from './game-params';
import { DealMessage } from './messages/deal-message';
import { Card } from './card';
import { Game } from '..';
import { DealOutMessage } from './messages/deal-out-message';

/**
 * Send a message to all the players
 * @param players the array of players
 * @param bundle the message to send
 */
function messageAll(players: Hand[], bundle: Message) {
    players.forEach((player) => player.message(bundle));
}

/**
 * Send a message to all the players minus the excluded
 * @param players the array of players
 * @param excluded the player to not send to
 * @param bundle the message to send
 */
function messageOthers(players: Hand[], excluded: Hand, bundle: Message) {
    players.forEach((player) => {
        if(player !== excluded)
            player.message(bundle);
    });
}

/**
 * Class that handles the steps of the game
 */
export class GameDriver {
    private players: Hand[];
    private gameState: GameState;

    /**
     * Create the game driver
     * @param players the players in the game
     * @param gameParams the parameters to use for the game
     */
    constructor(players: Handler[], gameParams: GameParams) {
        this.gameState = new GameState(players.length, gameParams);
        this.players = players.map((handler, i) => new Hand(handler, i));
    }

    /**
     * Deal out cards to all of the players' hands for the current round
     */
    private dealOut() {
        const state = this.gameState;
        // TODO migrate to message class
        this.players.forEach((p) => p.message(new Message(this.players[state.dealer].toString() + ' is dealer')));
        for (let num = 0; num < state.getNumToDeal(); num++) {
            for (let player = 0; player < this.players.length; player++) {
                const offset = state.dealer + 1;
                let card = state.deck.draw();
                if (!card) {
                    if(state.deck.shuffleDiscard()) {
                        // TODO add another deck?
                        throw new InvalidError('Deck ran out of cards');
                    } else {
                        messageAll(this.players, new ReshuffleMessage());
                        card = state.deck.draw();
                    }
                }
                this.giveCard((player + offset) % this.players.length, card, undefined, false);
            }
        }
        for (let player = 0; player < this.players.length; player++) {
            this.players[player].message(new DealOutMessage(this.gameState.hands[player]));
        }
    }

    /**
     * Gives a card to the player and notifies them
     * @param player the player to give the card to
     * @param card the card to give
     * @param extra the accompanying extra card, if applicable
     * @param dealt whether or not the card was dealt to the player
     */
    private giveCard(player: number, card: Card, extra?: Card, message: boolean = true) {
        this.gameState.hands[player].push(card);
        if (extra) {
            this.gameState.hands[player].push(extra);
        }
        if(message) {
            this.players[player].message(new DealMessage(card, extra));
        }
    }

    /**
     * Runs the game through to the end asyncronously
     */
    public async start() {
        const state = this.gameState;
        while(!state.completed) {
            await this.iterate();
        }
    }

    public async iterate() {
        const state = this.gameState;

        switch(state.state) {
            case GameState.State.START_GAME:
                state.state = GameState.State.START_ROUND;
                break;

            case GameState.State.START_ROUND:
                this.startRound();
                break;

            case GameState.State.WAIT_FOR_TURN_PLAYER_WANT:
                await this.waitForTurnPlayerWant();
                break;

            case GameState.State.HANDLE_TURN_PLAYER_WANT:
                this.handleTurnPlayerWant();
                break;

            case GameState.State.WAIT_FOR_PLAYER_WANT:
                await this.waitForPlayerWant();
                break;

            case GameState.State.HANDLE_PLAYER_WANT:
                this.handlePlayerWant();
                break;

            case GameState.State.HANDLE_NO_PLAYER_WANT:
                this.handleNoPlayerWant();
                break;

            case GameState.State.START_TURN:
                this.startTurn();
                break;

            case GameState.State.WAIT_FOR_TURN:
                await this.waitForTurn();
                break;

            case GameState.State.HANDLE_TURN:
                this.handleTurn();
                break;

            case GameState.State.END_ROUND:
                this.endRound();
                break;

            case GameState.State.END_GAME:
                state.completed = true;
                break;
        }

    }

    private startRound() {
        const state = this.gameState;
        messageAll(this.players, new StartRoundMessage(state.getRound()));
        state.setupRound();
        this.dealOut();
        state.deck.discard(state.deck.draw());

        if (state.deck.top === null) {
            throw new Error('Already null');
        }
        const top = state.deck.top;
        messageAll(this.players, new DiscardMessage(top));

        state.whoseTurn = (state.dealer + 1) % this.players.length;

        state.state = GameState.State.WAIT_FOR_TURN_PLAYER_WANT;
    }

    private endRound() {
        const state = this.gameState;
        state.nextRound();
        for (let player = 0; player < state.numPlayers; player++) {
            state.scores[player] += state.hands[player].map(card => card.rank.value).reduce((a, b) => a + b, 0);
        }

        messageAll(this.players, new EndRoundMessage(this.players.map(person => person.toString()), state.scores));

        state.state = GameState.State.START_ROUND;
    }

    private async waitForTurnPlayerWant() {
        const state = this.gameState;
        const card = state.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }
        const wantCard = await this.players[state.whoseTurn].wantCard(card, state);

        if(wantCard) {
            state.state = GameState.State.HANDLE_TURN_PLAYER_WANT;
        } else {
            state.whoseAsk = (state.whoseTurn + 1) % this.players.length;
            if(state.whoseAsk === state.whoseTurn) {
                state.state = GameState.State.HANDLE_NO_PLAYER_WANT;
            } else {
                state.state = GameState.State.WAIT_FOR_PLAYER_WANT;
            }
        }
    }

    private handleNoPlayerWant() {
        const state = this.gameState;
        if (state.deck.top !== null) {
            messageAll(this.players, new PickupMessage(state.deck.top));
            state.deck.clearTop();
        }

        state.state = GameState.State.START_TURN;
    }

    private async waitForPlayerWant() {
        const state = this.gameState;
        const card = state.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }
        const wantCard = await this.players[state.whoseAsk].wantCard(card, state, true);

        if(wantCard) {
            state.state = GameState.State.HANDLE_PLAYER_WANT;
        } else {
            state.whoseAsk = (state.whoseAsk + 1) % this.players.length;
            if(state.whoseAsk === state.whoseTurn) {
                state.state = GameState.State.HANDLE_NO_PLAYER_WANT;
            } else {
                state.state = GameState.State.WAIT_FOR_PLAYER_WANT;
            }
        }
    }

    private handleTurnPlayerWant() {
        const state = this.gameState;
        const card = state.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }
        this.giveCard(state.whoseTurn, card);
        messageOthers(this.players, this.players[state.whoseTurn], new PickupMessage(card, this.players[state.whoseTurn].toString(), false));
        state.deck.takeTop();

        state.state = GameState.State.WAIT_FOR_TURN;
    }

    private async waitForTurn() {
        const state = this.gameState;
        // turn
        state.turnPayload = await this.players[state.whoseTurn].turn(state);
        state.state = GameState.State.HANDLE_TURN;
    }

    private handleTurn() {
        const state = this.gameState;
        const { discard, played } = state.turnPayload;

        if(!discard) {
            // TODO check for final round
            if(!state.hands[state.whoseTurn].length) {
                state.state = GameState.State.END_ROUND;
            }
            return;
        }

        state.deck.discard(discard);
        if(played) {
            for(const [player, playedRuns] of zip(state.played, played)) {
                for(const [run, playedCards] of zip(player, playedRuns)) {
                    if(playedCards && playedCards.length) {
                        messageOthers(this.players, this.players[state.whoseTurn], new PlayedMessage(playedCards, run, this.players[state.whoseTurn].toString()));
                    }
                }
            }
        }
        messageOthers(this.players, this.players[state.whoseTurn], new DiscardMessage(discard, this.players[state.whoseTurn].toString()));

        if(state.hands[state.whoseTurn].length === 0) {
            messageAll(this.players, new Message(this.players[state.whoseTurn].toString() + ' is out of cards'));
            this.gameState.scores[state.whoseTurn] -= 10;
            state.state = GameState.State.END_ROUND;
            return;
        }

        state.state = GameState.State.WAIT_FOR_TURN_PLAYER_WANT;
        state.whoseTurn = (state.whoseTurn + 1) % this.players.length;
    }

    private handlePlayerWant() {
        const state = this.gameState;
        const whoseAsk = state.whoseAsk;
        const card = state.deck.top;

        if(!card) {
            throw new Error('Invalid State');
        }

        // tslint:disable-next-line
        let draw = state.deck.draw();
        if (!draw) {
            if(state.deck.shuffleDiscard()) {
                // TODO add another deck?
                throw new InvalidError('Deck ran out of cards');
            } else {
                messageAll(this.players, new ReshuffleMessage() );
                draw = state.deck.draw();
            }
        }
        this.giveCard(whoseAsk, card, draw);
        messageOthers(this.players, this.players[whoseAsk], new PickupMessage(card, this.players[whoseAsk].toString(), true));
        state.deck.takeTop();

        state.state = GameState.State.START_TURN;
    }

    private startTurn() {
        const state = this.gameState;
        const whoseTurn = state.whoseTurn;

        let draw = state.deck.draw();
        if (!draw) {
            if(state.deck.shuffleDiscard()) {
                // TODO add another deck?
                throw new InvalidError('Deck ran out of cards');
            } else {
                messageAll(this.players, new ReshuffleMessage());
                draw = state.deck.draw();
            }
        }
        this.giveCard(whoseTurn, draw);

        state.state = GameState.State.WAIT_FOR_TURN;
    }
}