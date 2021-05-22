import { Suit, GenericResponseValidator, Card, Rank, distinct, isDefined } from "@cards-ts/core";
import { GameParams } from "./game-params";
import { GameState } from "./game-state";
import { ResponseMessage } from "./messages/response-message";
import { PassResponseMessage } from "./messages/response/pass-response-message";
import { TurnResponseMessage } from "./messages/response/turn-response-message";
import { compare } from "./util/compare";

const QS = new Card(Suit.SPADES, Rank.QUEEN);

export class ResponseValidator implements GenericResponseValidator<GameParams, GameState.State, GameState, ResponseMessage> {
    validate(gameState: GameState, source: number, event: ResponseMessage): ResponseMessage | undefined {
        switch(event.type) {
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
}