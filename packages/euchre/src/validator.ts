import { GenericValidator } from "@cards-ts/core";
import { GameParams } from "./game-params";
import { GameState } from "./game-state";
import { DealerDiscardResponseMessage, GoingAloneResponseMessage, OrderUpResponseMessage, NameTrumpResponseMessage } from "./messages/response";
import { ResponseMessage } from "./messages/response-message";
import { TurnResponseMessage } from "./messages/response/turn-response-message";
import { followsTrick } from "./util/follows-trick";

export class Validator implements GenericValidator<GameParams, GameState.State, GameState, ResponseMessage> {
    validateEvent(gameState: GameState, source: number, event: ResponseMessage): ResponseMessage | undefined {
        switch(event.type) {
            case 'order-up-response': {
                if(source !== gameState.whoseTurn) {
                    return undefined;
                }
                const { selectingTrump, data } = event;
                return new OrderUpResponseMessage(selectingTrump, data);
            }
            case 'name-trump-response': {
                if(source !== gameState.whoseTurn) {
                    return undefined;
                }
                const { trump, data } = event;
                try {
                    if(gameState.currentTrump === trump) {
                        throw new Error('Can\'t select the current trump suit as the trump');
                    }
                    return new NameTrumpResponseMessage(trump, data);
                } catch (e) {
                    console.error('Invalid suit');
                }
                return new NameTrumpResponseMessage(undefined, event.data);
            }
            case 'going-alone-response': {
                return new GoingAloneResponseMessage(event.data);
            }
            case 'dealer-discard-response': {
                if(source !== gameState.dealer) {
                    return undefined;
                }
                const { selected, data } = event;
                try {
                    if(!selected) {
                        throw new Error('No card provided');
                    }

                    if(gameState.hands[source].find(selected.equals.bind(selected)) === undefined) {
                        throw new Error('Cannot play card that is not in hand');
                    }
                } catch (e) {
                    console.error('Invalid dealer discard', e);
                }
                return new DealerDiscardResponseMessage(selected, data);
            }
            case 'turn-response': {
                if(source !== gameState.whoseTurn) {
                    return undefined;
                }
                const { card, data } = event;
                // console.log(card.toString());
                // console.log(gameState.hands[source].sort(compare).toString());
                try {
                    if(!card) {
                        throw new Error('No card provided');
                    }

                    if(gameState.hands[source].find(card.equals.bind(card)) === undefined) {
                        throw new Error('Cannot play card that is not in hand');
                    }
                
                    if(gameState.currentTrick.some(card => card) && !followsTrick(gameState.currentTrick, gameState.currentTrump, card) && gameState.hands[source].some(card => followsTrick(gameState.currentTrick, gameState.currentTrump, card))) {
                        throw new Error('Must follow suit if possible');
                    }

                    return new TurnResponseMessage(card, data);
                } catch (e) {
                    console.error('Invalid turn', e);
                }

                return new TurnResponseMessage(gameState.hands[source].filter(card => followsTrick(gameState.currentTrick, gameState.currentTrump, card))[0] || gameState.hands[source][0], data);
            }
            case 'data-response': {
                return event;
            }
        }
    }

    validateState(gameState: GameState): void {
        // TODO better shape checking, maybe with GH-60
        if(typeof gameState !== 'object') {
            throw new Error('Not an object');
        }
        if(!Array.isArray(gameState.data) || !Array.isArray(gameState.hands) || !Array.isArray(gameState.names)) {
            throw new Error('Shape of object is wrong');
        }
        if((gameState.passed && !Array.isArray(gameState.passed)) || (gameState.currentTrick && !Array.isArray(gameState.currentTrick))) {
            throw new Error('Shape of object is wrong');
        }
    }
}