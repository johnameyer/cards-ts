import { Hand } from './hand';
import { Handler } from './handler';
import { GameState } from './game-state';
import { EndRoundMessage } from './messages/end-round-message';
import { StartRoundMessage } from './messages/start-round-message';
import { PickupMessage } from './messages/pickup-message';
import { ReshuffleMessage } from './messages/reshuffle-message';
import { DiscardMessage } from './messages/discard-message';
import { PlayedMessage } from './messages/played-message';
import { GameParams } from './game-params';
import { DealMessage } from './messages/deal-message';
import { DealOutMessage } from './messages/deal-out-message';
import { HandlerData } from './handler-data';
import { AbstractGameDriver, Message, Card, InvalidError, zip } from '@cards-ts/core';

/**
 * Class that handles the steps of the game
 */
export class GameDriver extends AbstractGameDriver<HandlerData, Handler, Hand, GameParams, GameState.State, GameState> {

    /**
     * Create the game driver
     * @param players the players in the game
     * @param gameParams the parameters to use for the game
     */
    constructor(players: Handler[], gameParams: GameParams, gameState?: GameState) {
        if(!gameState) {
            gameState = new GameState(players.length, gameParams);
        }

        const hands = players.map((handler, i) => new Hand(handler, i));
        super(hands, gameState);

        this.gameState = gameState;

        this.players = players.map((handler, i) => new Hand(handler, i));
        for(let i = 0; i < players.length; i++) {
            this.gameState.names[i] = this.players[i].getName(this.gameState.names.slice(0, i));
        }
    }

    /**
     * Deal out cards to all of the players' hands for the current round
     */
    private dealOut() {
        const state = this.gameState;
        this.messageAll(new Message([state.names[state.dealer], 'is dealer']));
        for (let num = 0; num < state.getNumToDeal(); num++) {
            for (let player = 0; player < this.players.length; player++) {
                const offset = state.dealer + 1;
                let card = state.deck.draw();
                if (!card) {
                    if(!state.deck.shuffleDiscard()) {
                        // TODO add another deck?
                        throw new InvalidError('Deck ran out of cards');
                    } else {
                        this.messageAll(new ReshuffleMessage());
                        card = state.deck.draw();
                    }
                }
                this.giveCard((player + offset) % this.players.length, card, undefined, false);
            }
        }
        for (let player = 0; player < this.players.length; player++) {
            this.players[player].message(new DealOutMessage(this.gameState.hands[player]), state);
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
            this.players[player].message(new DealMessage(card, extra), this.gameState);
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
        switch(this.gameState.state) {
            case GameState.State.START_GAME:
                this.startGame();
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
                this.endGame();
                break;
        }

    }

    private endGame() {
        this.gameState.completed = true;
    }

    private startGame() {
        this.gameState.state = GameState.State.START_ROUND;
    }

    private startRound() {
        const state = this.gameState;
        this.messageAll(new StartRoundMessage(state.getRound()));
        state.setupRound();
        this.dealOut();
        state.deck.discard(state.deck.draw());

        if (state.deck.top === null) {
            throw new Error('Already null');
        }
        const top = state.deck.top;
        this.messageAll(new DiscardMessage(top));

        state.whoseTurn = (state.dealer + 1) % this.players.length;

        state.state = GameState.State.WAIT_FOR_TURN_PLAYER_WANT;
    }

    private endRound() {
        const state = this.gameState;

        state.nextRound();
        for (let player = 0; player < state.numPlayers; player++) {
            state.points[player] += state.hands[player].map(card => card.rank.value).reduce((a, b) => a + b, 0);
        }

        this.messageAll(new EndRoundMessage(state.names, state.points));

        if(state.round !== state.gameParams.rounds.length) {
            state.state = GameState.State.START_ROUND;
        } else {
            state.state = GameState.State.END_GAME;
        }
    }

    private async waitForTurnPlayerWant() {
        const state = this.gameState;
        const card = state.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }
        this.waitingOthers(this.players, [this.players[state.whoseTurn]]);
        const wantCard = await this.players[state.whoseTurn].wantCard(card, state, true);
        this.waitingOthers(this.players);

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
            this.messageAll(new PickupMessage(state.deck.top));
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
        if(state.whoseAsk === undefined) {
            throw new InvalidError('Invalid State');
        }
        this.waitingOthers(this.players, [this.players[state.whoseAsk]]);
        const wantCard = await this.players[state.whoseAsk].wantCard(card, state);
        this.waitingOthers(this.players);

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
        this.messageOthers(state.whoseTurn, new PickupMessage(card, state.names[state.whoseTurn], false));
        state.deck.takeTop();

        state.state = GameState.State.WAIT_FOR_TURN;
    }

    private async waitForTurn() {
        const state = this.gameState;
        // turn
        this.waitingOthers(this.players, [this.players[state.whoseTurn]]);
        state.turnPayload = await this.players[state.whoseTurn].turn(state);
        this.waitingOthers(this.players);
        state.state = GameState.State.HANDLE_TURN;
    }

    private handleTurn() {
        const state = this.gameState;
        if(!state.turnPayload) {
            throw new InvalidError('Invalid State');
        }
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
                        this.messageOthers(state.whoseTurn, new PlayedMessage(playedCards, run, state.names[state.whoseTurn]));
                    }
                }
            }
        }
        this.messageOthers(state.whoseTurn, new DiscardMessage(discard, state.names[state.whoseTurn]));

        if(state.hands[state.whoseTurn].length === 0) {
            this.messageAll(new Message([state.names[state.whoseTurn], 'is out of cards']));
            this.gameState.points[state.whoseTurn] -= 10;
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
            if(!state.deck.shuffleDiscard()) {
                // TODO add another deck?
                throw new InvalidError('Deck ran out of cards');
            } else {
                this.messageAll(new ReshuffleMessage());
                draw = state.deck.draw();
            }
        }
        if(whoseAsk === undefined) {
            throw new InvalidError('Invalid State');
        }
        this.giveCard(whoseAsk, card, draw);
        this.messageOthers(whoseAsk, new PickupMessage(card, state.names[whoseAsk], true));
        state.deck.takeTop();

        state.state = GameState.State.START_TURN;
    }

    private startTurn() {
        const state = this.gameState;
        const whoseTurn = state.whoseTurn;

        let draw = state.deck.draw();
        if (!draw) {
            if(!state.deck.shuffleDiscard()) {
                // TODO add another deck?
                throw new InvalidError('Deck ran out of cards');
            } else {
                this.messageAll(new ReshuffleMessage());
                draw = state.deck.draw();
            }
        }
        this.giveCard(whoseTurn, draw);

        state.state = GameState.State.WAIT_FOR_TURN;
    }
}