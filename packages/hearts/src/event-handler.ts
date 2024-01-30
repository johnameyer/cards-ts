import { Controllers } from './controllers/controllers.js';
import { PassResponseMessage } from './messages/response/index.js';
import { ResponseMessage } from './messages/response-message.js';
import { Suit, Card, Rank, distinct, isDefined, EventHandlerInterface, PlayCardResponseMessage } from '@cards-ts/core';

const QS = new Card(Suit.SPADES, Rank.QUEEN);

export const eventHandler: EventHandlerInterface<Controllers, ResponseMessage> = {
    validateEvent(controllers: Controllers, source: number, event: ResponseMessage): ResponseMessage | undefined {
        switch (event.type) {
        case 'pass-response': {
            const { cards, data } = event;
            /*
             * console.log(cards.toString());
             * console.log(controllers.hand.get(source).sort(compare).toString());
             */
            try {
                if(!cards.every(isDefined)) {
                    // TODO better condition
                    throw new Error('Not all are cards');
                }

                if(cards.length !== controllers.params.get().numToPass) {
                    throw new Error('Wrong number of cards passed');
                }

                if(cards.filter(distinct).length !== controllers.params.get().numToPass) {
                    throw new Error('Cannot pass same card multiple times');
                }

                if(cards.some(card => controllers.hand.get(source).find(card.equals.bind(card)) === undefined)) {
                    throw new Error('Can only pass cards that are in hand');
                }

                return new PassResponseMessage(cards);
            } catch (e) {
                console.error('Invalid pass', e);
            }

            return new PassResponseMessage(controllers.hand.get(source).slice(0, controllers.params.get().numToPass));
        }
        case 'turn-response': {
            if(source !== controllers.turn.get()) {
                return undefined;
            }
            const { card } = event;
            /*
             * console.log(card.toString());
             * console.log(controllers.hand.get(source).toString());
             */
            try {
                if(!card) {
                    throw new Error('No card provided');
                }

                if(!controllers.hand.hasCard(card, source)) {
                    throw new Error('Cannot play card that is not in hand');
                }
                    
                if(controllers.trick.tricks === 0 && (card.suit === Suit.HEARTS || card.equals(QS))) {
                    throw new Error('Cannot give points on the first round');
                }
        
                if(controllers.trick.currentTrick[0] === undefined && card.suit === Suit.HEARTS && controllers.trickPoints.get().every(point => point === 0)) {
                    throw new Error('Blood has not been shed yet');
                }
        
                if(controllers.trick.currentTrick[0]?.suit && card.suit !== controllers.trick.currentTrick[0].suit && controllers.hand.get(source).some(card => card.suit === controllers.trick.currentTrick[0]?.suit)) {
                    throw new Error('Must follow suit if possible');
                }

                return new PlayCardResponseMessage(card);
            } catch (e) {
                console.error('Invalid turn', e);
            }

            const fallbackCard = controllers.hand.get(source).filter(card => card.suit === controllers.trick.currentTrick[0]?.suit)[0] || controllers.hand.get(source).filter(card => card.suit !== Suit.HEARTS)[0] || controllers.hand.get(source)[0];
            return new PlayCardResponseMessage(fallbackCard);
        }
        }
    },

    
    merge(controllers: Controllers, sourceHandler: number, incomingEvent: ResponseMessage): void {
        switch (incomingEvent.type) {
        case 'pass-response': {
            controllers.passing.setPassedFor(sourceHandler, incomingEvent.cards);
            controllers.waiting.removePosition(sourceHandler);
            return;
        }
        case 'turn-response': {
            controllers.trick.setPlayedCard(incomingEvent.card);
            controllers.waiting.removePosition(sourceHandler);
            return;
        }
        }
    },
};
