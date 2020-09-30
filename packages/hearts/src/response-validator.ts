import { Suit, AbstractResponseValidator, Card, Rank, AbstractGameState } from "@cards-ts/core";
import { GameParams } from "./game-params";
import { GameState } from "./game-state";
import { ResponseMessage } from "./messages/response-message";
import { PassResponseMessage } from "./messages/response/pass-response-message";
import { TurnResponseMessage } from "./messages/response/turn-response-message";

const QS = new Card(Suit.SPADES, Rank.QUEEN);

export class ResponseValidator extends AbstractResponseValidator<GameParams, GameState.State, GameState, ResponseMessage> {
    validate(gameState: GameState, source: number, event: ResponseMessage): ResponseMessage | undefined {
        switch(event.type) {
            case 'pass-response': {
                const { cards, data } = event;
                if(source !== gameState.whoseTurn) {
                    return undefined;
                }
                try {
                    if(cards.length !== gameState.gameParams.numToPass) {
                        throw new Error('Wrong number of cards passed');
                    }
                    return new PassResponseMessage(cards, data);
                } catch (e) {
                    console.error('Invalid pass', e);
                }

                return new PassResponseMessage(gameState.hands[source].slice(0, gameState.gameParams.numToPass), data);
            }
            case 'turn-response': {
                const { card, data } = event;
                try {
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