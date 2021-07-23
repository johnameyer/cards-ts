import { Suit, GenericValidator, Card, Rank, distinct, isDefined } from "@cards-ts/core";
import { GameParams } from "./game-params";
import { GameState } from "./game-state";
import { ResponseMessage } from "./messages/response-message";
import { PassResponseMessage } from "./messages/response/pass-response-message";
import { TurnResponseMessage } from "./messages/response/turn-response-message";

const QS = new Card(Suit.SPADES, Rank.QUEEN);

export class Validator implements GenericValidator<GameParams, GameState.State, GameState, ResponseMessage> {
    validateEvent(gameState: GameState, source: number, event: ResponseMessage): ResponseMessage | undefined {
        switch(event.type) {
            case 'pass-response': {
                const { cards, data } = event;
                // console.log(cards.toString());
                // console.log(gameState.hands[source].sort(compare).toString());
                try {
                    if(!cards.every(isDefined)) {
                        // TODO better condition
                        throw new Error('Not all are cards');
                    }

                    if(cards.length !== gameState.gameParams.numToPass) {
                        throw new Error('Wrong number of cards passed');
                    }

                    if(cards.filter(distinct).length !== gameState.gameParams.numToPass) {
                        throw new Error('Cannot pass same card multiple times');
                    }

                    if(cards.some(card => gameState.hands[source].find(card.equals.bind(card)) === undefined)) {
                        throw new Error('Can only pass cards that are in hand');
                    }

                    return new PassResponseMessage(cards, data);
                } catch (e) {
                    console.error('Invalid pass', e);
                }

                return new PassResponseMessage(gameState.hands[source].slice(0, gameState.gameParams.numToPass), data);
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
                    
                    if(gameState.tricks === 0 && (card.suit === Suit.HEARTS || card.equals(QS))) {
                        throw new Error('Cannot give points on the first round');
                    }
        
                    if(gameState.currentTrick[0] === undefined && card.suit === Suit.HEARTS && gameState.pointsTaken.every(point => point === 0)) {
                        throw new Error('Blood has not been shed yet');
                    }
        
                    if(gameState.currentTrick[0]?.suit && card.suit !== gameState.currentTrick[0].suit && gameState.hands[source].some(card => card.suit === gameState.currentTrick[0]?.suit)) {
                        throw new Error('Must follow suit if possible');
                    }

                    return new TurnResponseMessage(card, data);
                } catch (e) {
                    console.error('Invalid turn', e);
                }

                return new TurnResponseMessage(gameState.hands[source].filter(card => card.suit === gameState.currentTrick[0]?.suit)[0] || gameState.hands[source].filter(card => card.suit !== Suit.HEARTS)[0] || gameState.hands[source][0], data);
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