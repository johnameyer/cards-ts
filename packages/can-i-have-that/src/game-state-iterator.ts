import { GameHandler, GameHandlerParams } from './game-handler';
import { HandlerData } from './handler-data';
import { GenericGameStateIterator, Card, InvalidError, zip, HandlerProxy as GenericHandlerProxy } from '@cards-ts/core';
import { GameParams } from './game-params';
import { ReshuffleMessage, DealOutMessage, DealMessage, StartRoundMessage, DiscardMessage, EndRoundMessage, PickupMessage, PlayedMessage, DealerMessage, OutOfCardsMessage } from './messages/status';
import { ResponseMessage } from './messages/response-message';
import { GameState } from './game-state';
import { StateTransformer } from './state-transformer';
import { SystemHandlerParams } from '@cards-ts/core/lib/handlers/system-handler';

type HandlerProxy = GenericHandlerProxy<HandlerData, ResponseMessage, GameHandlerParams & SystemHandlerParams, GameParams, GameState.State, GameState, StateTransformer>;

/**
 * Class that handles the steps of the game
 */
export class GameStateIterator implements GenericGameStateIterator<HandlerData, ResponseMessage, GameHandlerParams & SystemHandlerParams, GameParams, GameState.State, GameState, StateTransformer> {
    /**
     * Deal out cards to all of the players' hands for the current round
     */
    private dealOut(gameState: GameState, handlerProxy: HandlerProxy) {
        handlerProxy.messageAll(gameState, new DealerMessage(gameState.names[gameState.dealer]));
        for (let num = 0; num < GameState.Helper.getNumToDeal(gameState); num++) {
            for (let player = 0; player < gameState.numPlayers; player++) {
                const offset = gameState.dealer + 1;
                let card = gameState.deck.draw();
                if (!card) {
                    if(!gameState.deck.shuffleDiscard()) {
                        // TODO add another deck?
                        throw new InvalidError('Deck ran out of cards');
                    } else {
                        handlerProxy.messageAll(gameState, new ReshuffleMessage());
                        card = gameState.deck.draw();
                    }
                }
                this.giveCard(gameState, handlerProxy, (player + offset) % gameState.numPlayers, card, undefined, false);
            }
        }
        for (let player = 0; player < gameState.numPlayers; player++) {
            handlerProxy.message(gameState, player, new DealOutMessage(gameState.hands[player]));
        }
    }

    /**
     * Gives a card to the player and notifies them
     * @param player the player to give the card to
     * @param card the card to give
     * @param extra the accompanying extra card, if applicable
     * @param dealt whether or not the card was dealt to the player
     */
    private giveCard(gameState: GameState, handlerProxy: HandlerProxy, player: number, card: Card, extra?: Card, message: boolean = true) {
        gameState.hands[player].push(card);
        if (extra) {
            gameState.hands[player].push(extra);
        }
        if(message) {
            handlerProxy.message(gameState, player, new DealMessage(card, extra));
        }
    }

    public iterate(gameState: GameState, handlerProxy: HandlerProxy): void {
        // console.log('P', gameState.points);
        // console.log('C', gameState.hands.map(hand => hand.length));
        // console.log(gameState.state);
        switch(gameState.state) {
            case GameState.State.START_GAME:
                this.startGame(gameState, handlerProxy);
                break;

            case GameState.State.START_ROUND:
                // console.log(gameState.gameParams.rounds[gameState.round]);
                this.startRound(gameState, handlerProxy);
                break;

            case GameState.State.WAIT_FOR_TURN_PLAYER_WANT:
                this.waitForTurnPlayerWant(gameState, handlerProxy);
                break;

            case GameState.State.HANDLE_TURN_PLAYER_WANT:
                this.handleTurnPlayerWant(gameState, handlerProxy);
                break;

            case GameState.State.WAIT_FOR_PLAYER_WANT:
                this.waitForPlayerWant(gameState, handlerProxy);
                break;

            case GameState.State.HANDLE_PLAYER_WANT:
                this.handlePlayerWant(gameState, handlerProxy);
                break;

            case GameState.State.HANDLE_NO_PLAYER_WANT:
                this.handleNoPlayerWant(gameState, handlerProxy);
                break;

            case GameState.State.START_TURN:
                this.startTurn(gameState, handlerProxy);
                break;

            case GameState.State.WAIT_FOR_TURN:
                this.waitForTurn(gameState, handlerProxy);
                break;

            case GameState.State.HANDLE_TURN:
                this.handleTurn(gameState, handlerProxy);
                break;

            case GameState.State.END_ROUND:
                this.endRound(gameState, handlerProxy);
                break;

            case GameState.State.END_GAME:
                this.endGame(gameState);
                break;
        }
    }

    private endGame(gameState: GameState) {
        gameState.completed = true;
    }

    private startGame(gameState: GameState, handlerProxy: HandlerProxy) {
        gameState.state = GameState.State.START_ROUND;

        gameState.numPlayers = handlerProxy.getNumberOfPlayers();

        GameState.Helper.setupRound(gameState);
    }

    private startRound(gameState: GameState, handlerProxy: HandlerProxy) {
        GameState.Helper.setupRound(gameState);
        handlerProxy.messageAll(gameState, new StartRoundMessage(GameState.Helper.getRound(gameState)));
        this.dealOut(gameState, handlerProxy);
        gameState.deck.discard(gameState.deck.draw());

        if (gameState.deck.top === null) {
            throw new Error('Already null');
        }
        const top = gameState.deck.top;
        handlerProxy.messageAll(gameState, new DiscardMessage(top));

        gameState.whoseTurn = (gameState.dealer + 1) % gameState.numPlayers;
        gameState.whoseAsk = gameState.whoseTurn;

        gameState.state = GameState.State.WAIT_FOR_TURN_PLAYER_WANT;
    }

    private endRound(gameState: GameState, handlerProxy: HandlerProxy) {
        GameState.Helper.nextRound(gameState);
        for (let player = 0; player < gameState.numPlayers; player++) {
            gameState.points[player] += gameState.hands[player].map(card => card.rank.value).reduce((a, b) => a + b, 0);
        }

        handlerProxy.messageAll(gameState, new EndRoundMessage(gameState.names, gameState.points));

        if(gameState.round !== gameState.gameParams.rounds.length) {
            gameState.state = GameState.State.START_ROUND;
        } else {
            gameState.state = GameState.State.END_GAME;
        }
    }

    private waitForTurnPlayerWant(gameState: GameState, handlerProxy: HandlerProxy) {
        const card = gameState.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }

        handlerProxy.handlerCall(gameState, gameState.whoseTurn, 'wantCard');

        gameState.state = GameState.State.HANDLE_TURN_PLAYER_WANT;
    }

    private handleNoPlayerWant(gameState: GameState, handlerProxy: HandlerProxy) {
        if (gameState.deck.top !== null) {
            handlerProxy.messageAll(gameState, new PickupMessage(gameState.deck.top));
            gameState.deck.clearTop();
        }

        gameState.state = GameState.State.START_TURN;
    }

    private waitForPlayerWant(gameState: GameState, handlerProxy: HandlerProxy) {
        const card = gameState.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }
        if(gameState.whoseAsk === undefined) {
            throw new InvalidError('Invalid State');
        }

        handlerProxy.handlerCall(gameState, gameState.whoseAsk, 'wantCard');

        gameState.state = GameState.State.HANDLE_PLAYER_WANT;
    }

    private handleTurnPlayerWant(gameState: GameState, handlerProxy: HandlerProxy) {
        const card = gameState.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }

        const wantCard = gameState.wantCard;

        if(wantCard) {
            this.giveCard(gameState, handlerProxy, gameState.whoseTurn, card);
            handlerProxy.messageOthers(gameState, gameState.whoseTurn, new PickupMessage(card, gameState.names[gameState.whoseTurn], false));
            gameState.deck.takeTop();

            gameState.state = GameState.State.WAIT_FOR_TURN;
        } else {
            gameState.whoseAsk = (gameState.whoseAsk + 1) % gameState.numPlayers;
            if(gameState.whoseAsk === gameState.whoseTurn) {
                gameState.state = GameState.State.HANDLE_NO_PLAYER_WANT;
            } else {
                gameState.state = GameState.State.WAIT_FOR_PLAYER_WANT;
            }
        }
    }

    private waitForTurn(gameState: GameState, handlerProxy: HandlerProxy) {
        gameState.toDiscard = null;
        gameState.toPlayOnOthers = [];
        gameState.toGoDown = [];

        handlerProxy.handlerCall(gameState, gameState.whoseTurn, 'turn');

        gameState.state = GameState.State.HANDLE_TURN;
    }

    private handleTurn(gameState: GameState, handlerProxy: HandlerProxy) {
        // if(!gameState.toPlay) {
        //     throw new InvalidError('Invalid State');
        // }
        
        const { toGoDown, toDiscard, toPlayOnOthers } = gameState;

        if(!toDiscard) {
            // TODO check for final round
            if(!gameState.hands[gameState.whoseTurn].length) {
                gameState.state = GameState.State.END_ROUND;
            }
            return;
        }

        gameState.deck.discard(toDiscard);
        if(toGoDown.length) {
            for(const meld of toGoDown) {
                handlerProxy.messageOthers(gameState, gameState.whoseTurn, new PlayedMessage(meld.cards, meld, gameState.names[gameState.whoseTurn]));
            }
            gameState.played[gameState.whoseTurn] = toGoDown;
        }

        if(toPlayOnOthers.length) {
            for(let position = 0; position < gameState.played.length; position++) {
                if(!toPlayOnOthers[position] || !toPlayOnOthers[position].length) {
                    continue;
                }
                for(let meld = 0; meld < gameState.played[position].length; meld++) {
                    if(!toPlayOnOthers[position][meld] || !toPlayOnOthers[position][meld].length) {
                        continue;
                    }
                    handlerProxy.messageOthers(gameState, gameState.whoseTurn, new PlayedMessage(toPlayOnOthers[position][meld], gameState.played[position][meld], gameState.names[gameState.whoseTurn]));
                }
            }
        }

        if(toDiscard) {
            handlerProxy.messageOthers(gameState, gameState.whoseTurn, new DiscardMessage(toDiscard, gameState.names[gameState.whoseTurn]));
        }

        if(gameState.hands[gameState.whoseTurn].length === 0) {
            handlerProxy.messageAll(gameState, new OutOfCardsMessage(gameState.names[gameState.whoseTurn]));
            gameState.points[gameState.whoseTurn] -= 10;
            gameState.state = GameState.State.END_ROUND;
            return;
        }

        gameState.state = GameState.State.WAIT_FOR_TURN_PLAYER_WANT;
        gameState.whoseTurn = (gameState.whoseTurn + 1) % gameState.numPlayers;
        gameState.whoseAsk = gameState.whoseTurn;
    }

    private handlePlayerWant(gameState: GameState, handlerProxy: HandlerProxy) {
        
        const whoseAsk = gameState.whoseAsk;
        const card = gameState.deck.top;

        const wantCard = gameState.wantCard;

        if(!card) {
            throw new Error('Invalid State');
        }

        if(wantCard) {
            // tslint:disable-next-line
            let draw = gameState.deck.draw();
            if (!draw) {
                if(!gameState.deck.shuffleDiscard()) {
                    // TODO add another deck?
                    throw new InvalidError('Deck ran out of cards');
                } else {
                    handlerProxy.messageAll(gameState, new ReshuffleMessage());
                    draw = gameState.deck.draw();
                }
            }
            if(whoseAsk === undefined) {
                throw new InvalidError('Invalid State');
            }
            this.giveCard(gameState, handlerProxy, whoseAsk, card, draw);
            handlerProxy.messageOthers(gameState, whoseAsk, new PickupMessage(card, gameState.names[whoseAsk], true));
            gameState.deck.takeTop();

            gameState.state = GameState.State.START_TURN;
        } else {
            gameState.whoseAsk = (gameState.whoseAsk + 1) % gameState.numPlayers;
            if(gameState.whoseAsk === gameState.whoseTurn) {
                gameState.state = GameState.State.HANDLE_NO_PLAYER_WANT;
            } else {
                gameState.state = GameState.State.WAIT_FOR_PLAYER_WANT;
            }
        }
    }

    private startTurn(gameState: GameState, handlerProxy: HandlerProxy) {
        const whoseTurn = gameState.whoseTurn;

        let draw = gameState.deck.draw();
        if (!draw) {
            if(!gameState.deck.shuffleDiscard()) {
                // TODO add another deck?
                throw new InvalidError('Deck ran out of cards');
            } else {
                handlerProxy.messageAll(gameState, new ReshuffleMessage());
                draw = gameState.deck.draw();
            }
        }
        this.giveCard(gameState, handlerProxy, whoseTurn, draw);

        gameState.state = GameState.State.WAIT_FOR_TURN;
    }
}