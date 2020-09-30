import { Handler } from './handler';
import { GameState } from './game-state';
import { HandlerData } from './handler-data';
import { AbstractGameDriver, Card, InvalidError, zip } from '@cards-ts/core';
import { GameParams } from './game-params';
import { ReshuffleMessage, DealOutMessage, DealMessage, StartRoundMessage, DiscardMessage, EndRoundMessage, PickupMessage, PlayedMessage, DealerMessage, OutOfCardsMessage } from './messages/status';
import { ResponseMessage } from './messages/response-message';
import { StateTransformer } from './state-transformer';
import { TurnResponseMessage, WantCardResponseMessage } from './messages/response';

/**
 * Class that handles the steps of the game
 */
export class GameDriver extends AbstractGameDriver<HandlerData, Handler, GameParams, GameState.State, GameState, ResponseMessage, StateTransformer> {
    /**
     * Deal out cards to all of the players' hands for the current round
     */
    private dealOut() {
        const state = this.gameState;
        this.handlerProxy.messageAll(this.gameState, new DealerMessage(state.names[state.dealer]));
        for (let num = 0; num < GameState.Helper.getNumToDeal(state); num++) {
            for (let player = 0; player < this.gameState.numPlayers; player++) {
                const offset = state.dealer + 1;
                let card = state.deck.draw();
                if (!card) {
                    if(!state.deck.shuffleDiscard()) {
                        // TODO add another deck?
                        throw new InvalidError('Deck ran out of cards');
                    } else {
                        this.handlerProxy.messageAll(this.gameState, new ReshuffleMessage());
                        card = state.deck.draw();
                    }
                }
                this.giveCard((player + offset) % this.gameState.numPlayers, card, undefined, false);
            }
        }
        for (let player = 0; player < this.gameState.numPlayers; player++) {
            this.handlerProxy.message(this.gameState, player, new DealOutMessage(this.gameState.hands[player]));
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
            this.handlerProxy.message(this.gameState, player, new DealMessage(card, extra));
        }
    }

    public iterate(): void | [number, ResponseMessage | Promise<ResponseMessage>] {
        switch(this.gameState.state) {
            case GameState.State.START_GAME:
                this.startGame();
                break;

            case GameState.State.START_ROUND:
                this.startRound();
                break;

            case GameState.State.WAIT_FOR_TURN_PLAYER_WANT:
                return this.waitForTurnPlayerWant();

            case GameState.State.HANDLE_TURN_PLAYER_WANT:
                this.handleTurnPlayerWant();
                break;

            case GameState.State.WAIT_FOR_PLAYER_WANT:
                return this.waitForPlayerWant();
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
                return this.waitForTurn();
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

        this.gameState.numPlayers = this.handlerProxy.getNumberOfPlayers();

        GameState.Helper.setupRound(this.gameState);
    }

    private startRound() {
        const state = this.gameState;
        GameState.Helper.setupRound(this.gameState);
        this.handlerProxy.messageAll(this.gameState, new StartRoundMessage(GameState.Helper.getRound(this.gameState)));
        this.dealOut();
        state.deck.discard(state.deck.draw());

        if (state.deck.top === null) {
            throw new Error('Already null');
        }
        const top = state.deck.top;
        this.handlerProxy.messageAll(this.gameState, new DiscardMessage(top));

        state.whoseTurn = (state.dealer + 1) % this.gameState.numPlayers;

        state.state = GameState.State.WAIT_FOR_TURN_PLAYER_WANT;
    }

    private endRound() {
        const state = this.gameState;

        GameState.Helper.nextRound(this.gameState);
        for (let player = 0; player < state.numPlayers; player++) {
            state.points[player] += state.hands[player].map(card => card.rank.value).reduce((a, b) => a + b, 0);
        }

        this.handlerProxy.messageAll(this.gameState, new EndRoundMessage(state.names, state.points));

        if(state.round !== state.gameParams.rounds.length) {
            state.state = GameState.State.START_ROUND;
        } else {
            state.state = GameState.State.END_GAME;
        }
    }

    private waitForTurnPlayerWant(): [number, WantCardResponseMessage | Promise<WantCardResponseMessage>] {
        const state = this.gameState;
        const card = state.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }

        this.handlerProxy.waitingOthers(this.gameState, [state.whoseTurn]);
        const result = this.handlerProxy.handlerCall(this.gameState, state.whoseTurn, 'wantCard');
        this.handlerProxy.waitingOthers(this.gameState);

        state.state = GameState.State.HANDLE_TURN_PLAYER_WANT;

        return [state.whoseAsk, result];
    }

    private handleNoPlayerWant() {
        const state = this.gameState;
        if (state.deck.top !== null) {
            this.handlerProxy.messageAll(this.gameState, new PickupMessage(state.deck.top));
            state.deck.clearTop();
        }

        state.state = GameState.State.START_TURN;
    }

    private waitForPlayerWant(): [number, WantCardResponseMessage | Promise<WantCardResponseMessage>] {
        const state = this.gameState;
        const card = state.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }
        if(state.whoseAsk === undefined) {
            throw new InvalidError('Invalid State');
        }
        this.handlerProxy.waitingOthers(this.gameState, [state.whoseAsk]);
        const result = this.handlerProxy.handlerCall(this.gameState, state.whoseAsk, 'wantCard');
        this.handlerProxy.waitingOthers(this.gameState);

        state.state = GameState.State.HANDLE_PLAYER_WANT;

        return [state.whoseAsk, result];
    }

    private handleTurnPlayerWant() {
        const state = this.gameState;
        const card = state.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }

        const wantCard = state.wantCard;

        if(wantCard) {
            this.giveCard(state.whoseTurn, card);
            this.handlerProxy.messageOthers(this.gameState, state.whoseTurn, new PickupMessage(card, state.names[state.whoseTurn], false));
            state.deck.takeTop();

            state.state = GameState.State.WAIT_FOR_TURN;
        } else {
            state.whoseAsk = (state.whoseTurn + 1) % this.gameState.numPlayers;
            if(state.whoseAsk === state.whoseTurn) {
                state.state = GameState.State.HANDLE_NO_PLAYER_WANT;
            } else {
                state.state = GameState.State.WAIT_FOR_PLAYER_WANT;
            }
        }

        

    }

    private waitForTurn(): [number, TurnResponseMessage | Promise<TurnResponseMessage>] {
        const state = this.gameState;

        this.handlerProxy.waitingOthers(this.gameState, [state.whoseTurn]);
        const result = this.handlerProxy.handlerCall(this.gameState, state.whoseTurn, 'turn');
        this.handlerProxy.waitingOthers(this.gameState);
        state.state = GameState.State.HANDLE_TURN;

        return [state.whoseTurn, result];
    }

    private handleTurn() {
        const state = this.gameState;
        if(!state.toPlay) {
            throw new InvalidError('Invalid State');
        }
        
        const discard = state.toDiscard;
        const toPlay = state.toPlay;

        if(!discard) {
            // TODO check for final round
            if(!state.hands[state.whoseTurn].length) {
                state.state = GameState.State.END_ROUND;
            }
            return;
        }

        state.deck.discard(discard);
        if(toPlay) {
            for(const [playedRuns, toPlayRuns] of zip(state.played, toPlay)) {
                for(const [playedCards, toPlayCards] of zip(playedRuns, toPlayRuns)) {
                    const newCards = toPlayCards.cards.filter(card => playedCards.cards.find(card.equals.bind(card)) === null);
                    if(newCards && newCards.length) {
                        this.handlerProxy.messageOthers(state, state.whoseTurn, new PlayedMessage(newCards, playedCards, state.names[state.whoseTurn]));
                    }
                }
            }
        }
        this.handlerProxy.messageOthers(this.gameState, state.whoseTurn, new DiscardMessage(discard, state.names[state.whoseTurn]));

        if(state.hands[state.whoseTurn].length === 0) {
            this.handlerProxy.messageAll(this.gameState, new OutOfCardsMessage(state.names[state.whoseTurn]));
            this.gameState.points[state.whoseTurn] -= 10;
            state.state = GameState.State.END_ROUND;
            return;
        }

        state.state = GameState.State.WAIT_FOR_TURN_PLAYER_WANT;
        state.whoseTurn = (state.whoseTurn + 1) % this.gameState.numPlayers;
    }

    private handlePlayerWant() {
        const state = this.gameState;
        const whoseAsk = state.whoseAsk;
        const card = state.deck.top;

        const wantCard = state.wantCard;

        if(!card) {
            throw new Error('Invalid State');
        }

        if(wantCard) {
            // tslint:disable-next-line
            let draw = state.deck.draw();
            if (!draw) {
                if(!state.deck.shuffleDiscard()) {
                    // TODO add another deck?
                    throw new InvalidError('Deck ran out of cards');
                } else {
                    this.handlerProxy.messageAll(this.gameState, new ReshuffleMessage());
                    draw = state.deck.draw();
                }
            }
            if(whoseAsk === undefined) {
                throw new InvalidError('Invalid State');
            }
            this.giveCard(whoseAsk, card, draw);
            this.handlerProxy.messageOthers(this.gameState, whoseAsk, new PickupMessage(card, state.names[whoseAsk], true));
            state.deck.takeTop();

            state.state = GameState.State.START_TURN;
        } else {
            state.whoseAsk = (state.whoseAsk + 1) % this.gameState.numPlayers;
            if(state.whoseAsk === state.whoseTurn) {
                state.state = GameState.State.HANDLE_NO_PLAYER_WANT;
            } else {
                state.state = GameState.State.WAIT_FOR_PLAYER_WANT;
            }
        }
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
                this.handlerProxy.messageAll(this.gameState, new ReshuffleMessage());
                draw = state.deck.draw();
            }
        }
        this.giveCard(whoseTurn, draw);

        state.state = GameState.State.WAIT_FOR_TURN;
    }
}