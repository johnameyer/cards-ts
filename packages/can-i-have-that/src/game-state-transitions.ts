import { GameStates } from './game-states.js';
import { Controllers } from './controllers/controllers.js';
import { PickupMessage, StartRoundMessage } from './messages/status/index.js';
import { Card, InvalidError, SpacingMessage, GenericGameState, GenericGameStateTransitions, PickupMessage as PublicPickup, DiscardMessage, EndRoundMessage, OutOfCardsMessage, PlayedMessage, ReshuffleMessage } from '@cards-ts/core';

type GameState = GenericGameState<Controllers>;

/**
 * Class that handles the steps of the game
 */
export class GameStateTransitions implements GenericGameStateTransitions<typeof GameStates, Controllers> {

    /**
     * Gives a card to the player and notifies them
     * @param player the player to give the card to
     * @param card the card to give
     * @param extra the accompanying extra card, if applicable
     * @param dealt whether or not the card was dealt to the player
     */
    private giveCard(controllers: Controllers, player: number, card: Card, extra?: Card, message = true) {
        controllers.hand.get(player).push(card);
        if(extra) {
            controllers.hand.get(player).push(extra);
        }
        if(message) {
            controllers.players.message(player, new PickupMessage(card, extra));
        }
    }

    public get() {
        /*
         * console.log('P', gameState.points);
         * console.log('C', gameState.hands.map(hand => hand.length));
         * console.log(GameStates);
         */
        return {
            [GameStates.START_GAME]: this.startGame,
            [GameStates.START_ROUND]: this.startRound,
            [GameStates.WAIT_FOR_TURN_PLAYER_WANT]: this.waitForTurnPlayerWant,
            [GameStates.HANDLE_TURN_PLAYER_WANT]: this.handleTurnPlayerWant,
            [GameStates.WAIT_FOR_PLAYER_WANT]: this.waitForPlayerWant,
            [GameStates.HANDLE_PLAYER_WANT]: this.handlePlayerWant,
            [GameStates.HANDLE_NO_PLAYER_WANT]: this.handleNoPlayerWant,
            [GameStates.START_TURN]: this.startTurn,
            [GameStates.WAIT_FOR_TURN]: this.waitForTurn,
            [GameStates.HANDLE_TURN]: this.handleTurn,
            [GameStates.END_ROUND]: this.endRound,
            [GameStates.END_GAME]: this.endGame,
        };
    }

    private endGame(controllers: Controllers) {
        controllers.completed.complete();
    }

    private startGame(controllers: Controllers) {
        controllers.state.set(GameStates.START_ROUND);

        setupRound(controllers);
    }

    private startRound(controllers: Controllers) {
        setupRound(controllers);
        controllers.players.messageAll(new StartRoundMessage(controllers.canIHaveThat.getRound()));
        controllers.hand.dealOut(true, true, controllers.canIHaveThat.getNumToDeal());

        const top = controllers.deck.deck.flip();
        controllers.players.messageAll(new DiscardMessage(top));

        controllers.turn.set((controllers.deck.dealer + 1) % controllers.players.count);
        controllers.ask.set(controllers.turn.get());

        controllers.state.set(GameStates.WAIT_FOR_TURN_PLAYER_WANT);
    }

    private endRound(controllers: Controllers) {
        controllers.canIHaveThat.nextRound();
        for(let player = 0; player < controllers.players.count; player++) {
            controllers.score.increaseScore(player, controllers.hand.get(player).map(card => card.rank.value)
                .reduce((a, b) => a + b, 0));
        }

        controllers.players.messageAll(new EndRoundMessage(controllers.names.get(), controllers.score.get()));
        controllers.players.messageAll(new SpacingMessage());

        if(controllers.canIHaveThat.round !== controllers.params.get().rounds.length) {
            controllers.state.set(GameStates.START_ROUND);
        } else {
            controllers.state.set(GameStates.END_GAME);
        }
    }

    private waitForTurnPlayerWant(controllers: Controllers) {
        const card = controllers.deck.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }

        controllers.players.handlerCall(controllers.turn.get(), 'wantCard');

        controllers.state.set(GameStates.HANDLE_TURN_PLAYER_WANT);
    }

    private handleNoPlayerWant(controllers: Controllers) {
        if(controllers.deck.deck.top !== null) {
            controllers.players.messageAll(new PublicPickup(controllers.deck.deck.top));
            controllers.deck.deck.clearTop();
        }

        controllers.state.set(GameStates.START_TURN);
    }

    private waitForPlayerWant(controllers: Controllers) {
        const card = controllers.deck.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }
        if(controllers.ask.get() === undefined) {
            throw new InvalidError('Invalid State');
        }

        controllers.players.handlerCall(controllers.ask.get(), 'wantCard');

        controllers.state.set(GameStates.HANDLE_PLAYER_WANT);
    }

    private handleTurnPlayerWant(controllers: Controllers) {
        const card = controllers.deck.deck.top;
        if(!card) {
            throw new Error('Invalid State');
        }

        const wantCard = controllers.canIHaveThat.wantCard;

        if(wantCard) {
            this.giveCard(controllers, controllers.turn.get(), card);
            controllers.players.messageOthers(controllers.turn.get(), new PublicPickup(card, controllers.names.get(controllers.turn.get()), false));
            controllers.deck.deck.takeTop();

            controllers.state.set(GameStates.WAIT_FOR_TURN);
        } else {
            controllers.ask.next();
            if(controllers.ask.get() === controllers.turn.get()) {
                controllers.state.set(GameStates.HANDLE_NO_PLAYER_WANT);
            } else {
                controllers.state.set(GameStates.WAIT_FOR_PLAYER_WANT);
            }
        }
    }

    private waitForTurn(controllers: Controllers) {
        controllers.deck.toDiscard = null;
        controllers.melds.resetTransient();

        controllers.players.handlerCall(controllers.turn.get(), 'turn');

        controllers.state.set(GameStates.HANDLE_TURN);
    }

    private handleTurn(controllers: Controllers) {
        /*
         * if(!controllers.toPlay) {
         *     throw new InvalidError('Invalid State');
         * }
         */

        if(!controllers.deck.toDiscard) {
            // TODO check for final round
            if(!controllers.hand.get(controllers.turn.get()).length) {
                controllers.state.set(GameStates.END_ROUND);
            }
            return;
        }

        controllers.deck.discard();
        if(controllers.melds.toPlay.length) {
            for(const meld of controllers.melds.toPlay) {
                controllers.players.messageOthers(controllers.turn.get(), new PlayedMessage(meld.cards, meld, controllers.names.get(controllers.turn.get())));
            }
            controllers.melds.get()[controllers.turn.get()] = controllers.melds.toPlay;
        }

        if(controllers.melds.toPlayOnOthers.length) {
            for(let position = 0; position < controllers.melds.get().length; position++) {
                if(!controllers.melds.toPlayOnOthers[position] || !controllers.melds.toPlayOnOthers[position].length) {
                    continue;
                }
                for(let meld = 0; meld < controllers.melds.get()[position].length; meld++) {
                    if(!controllers.melds.toPlayOnOthers[position][meld] || !controllers.melds.toPlayOnOthers[position][meld].length) {
                        continue;
                    }
                    controllers.players.messageOthers(controllers.turn.get(), new PlayedMessage(controllers.melds.toPlayOnOthers[position][meld], controllers.melds.get()[position][meld], controllers.names.get(controllers.turn.get())));
                }
            }
        }

        if(controllers.deck.toDiscard) {
            controllers.players.messageOthers(controllers.turn.get(), new DiscardMessage(controllers.deck.toDiscard, controllers.names.get(controllers.turn.get())));
        }

        if(controllers.hand.get(controllers.turn.get()).length === 0) {
            controllers.players.messageAll(new OutOfCardsMessage(controllers.names.get(controllers.turn.get())));
            controllers.score.decreaseScore(controllers.turn.get(), 10);
            controllers.state.set(GameStates.END_ROUND);
            return;
        }

        controllers.state.set(GameStates.WAIT_FOR_TURN_PLAYER_WANT);
        controllers.turn.next();
        controllers.ask.set(controllers.turn.get());
    }

    private handlePlayerWant(controllers: Controllers) {
        const whoseAsk = controllers.ask.get();
        const card = controllers.deck.deck.top;

        const wantCard = controllers.canIHaveThat.wantCard;

        if(!card) {
            throw new Error('Invalid State');
        }

        if(wantCard) {
            let draw = controllers.deck.deck.draw();
            if(!draw) {
                if(!controllers.deck.deck.shuffleDiscard()) {
                    // TODO add another deck?
                    throw new InvalidError('Deck ran out of cards');
                } else {
                    controllers.players.messageAll(new ReshuffleMessage());
                    draw = controllers.deck.deck.draw();
                }
            }
            if(whoseAsk === undefined) {
                throw new InvalidError('Invalid State');
            }
            this.giveCard(controllers, whoseAsk, card, draw);
            controllers.players.messageOthers(whoseAsk, new PublicPickup(card, controllers.names.get(whoseAsk), true));
            controllers.deck.deck.takeTop();

            controllers.state.set(GameStates.START_TURN);
        } else {
            controllers.ask.next();
            if(controllers.ask.get() === controllers.turn.get()) {
                controllers.state.set(GameStates.HANDLE_NO_PLAYER_WANT);
            } else {
                controllers.state.set(GameStates.WAIT_FOR_PLAYER_WANT);
            }
        }
    }

    private startTurn(controllers: Controllers) {
        const whoseTurn = controllers.turn.get();

        let draw = controllers.deck.deck.draw();
        if(!draw) {
            if(!controllers.deck.deck.shuffleDiscard()) {
                // TODO add another deck?
                throw new InvalidError('Deck ran out of cards');
            } else {
                controllers.players.messageAll(new ReshuffleMessage());
                draw = controllers.deck.deck.draw();
            }
        }
        this.giveCard(controllers, whoseTurn, draw);

        controllers.state.set(GameStates.WAIT_FOR_TURN);
    }
}

/**
 * Sets up the state for a new round
 */
export function setupRound(controllers: Controllers) {
    controllers.hand.reset();
    controllers.melds.reset();
    controllers.deck.resetDeck();
}
