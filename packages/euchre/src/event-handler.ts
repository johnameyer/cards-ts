import { Controllers } from './controllers/controllers.js';
import { DealerDiscardResponseMessage, GoingAloneResponseMessage, OrderUpResponseMessage, NameTrumpResponseMessage } from './messages/response/index.js';
import { ResponseMessage } from './messages/response-message.js';
import { followsTrick } from './util/follows-trick.js';
import { PlayCardResponseMessage, wrapEventHandler } from '@cards-ts/core';

export const eventHandler = wrapEventHandler<Controllers, ResponseMessage>({
    validateEvent: {
        // TODO shore up the logic of what events we are expecting (not just the static handler logic)
        'order-up-response': (controllers, source, { selectingTrump }) => {
            if(source !== controllers.turn.get()) {
                return undefined;
            }
            return new OrderUpResponseMessage(selectingTrump);
        },
        'name-trump-response': (controllers, source, { trump }) => {
            if(source !== controllers.turn.get()) {
                return undefined;
            }
            try {
                if(controllers.euchre.currentTrump === trump) {
                    throw new Error('Can\'t select the current trump suit as the trump');
                }
                return new NameTrumpResponseMessage(trump);
            } catch (e) {
                console.error('Invalid suit');
            }
            return new NameTrumpResponseMessage(undefined);
        },
        'going-alone-response': (_controllers, _source, _incomingEvent) => {
            return new GoingAloneResponseMessage();
        },
        'dealer-discard-response': (controllers, source, { selected }) => {
            if(source !== controllers.turn.get()) {
                return undefined;
            }
            try {
                if(!selected) {
                    throw new Error('No card provided');
                }

                if(!controllers.hand.hasCard(selected, source)) {
                    throw new Error('Cannot play card that is not in hand');
                }

                return new DealerDiscardResponseMessage(selected);
            } catch (e) {
                console.error('Invalid dealer discard', e);
            }
                
            return new DealerDiscardResponseMessage(controllers.hand.get(source)[0]);
        },
        'turn-response': (controllers, source, { card }) => {
            if(source !== controllers.turn.get()) {
                return undefined;
            }
            /*
             * console.log(card.toString());
             * console.log(gameState.hands[source].sort(compare).toString());
             */
            try {
                if(!card) {
                    throw new Error('No card provided');
                }

                if(!controllers.hand.hasCard(card, source)) {
                    throw new Error('Cannot play card that is not in hand');
                }
                
                if(controllers.trick.currentTrick.some(card => card) && !followsTrick(controllers.trick.currentTrick, controllers.euchre.currentTrump, card) && controllers.hand.get(source).some(card => followsTrick(controllers.trick.currentTrick, controllers.euchre.currentTrump, card))) {
                    throw new Error('Must follow suit if possible');
                }

                return new PlayCardResponseMessage(card);
            } catch (e) {
                console.error('Invalid turn', e);
            }

            return new PlayCardResponseMessage(controllers.hand.get(source).filter(card => followsTrick(controllers.trick.currentTrick, controllers.euchre.currentTrump, card))[0] || controllers.hand.get(source)[0]);
        }
    },
    merge: {
        'order-up-response': (controllers, sourceHandler, incomingEvent) => {
            controllers.euchre.setBidder(incomingEvent.selectingTrump ? sourceHandler : undefined);
            controllers.waiting.removePosition(sourceHandler);
        },
        'name-trump-response': (controllers, sourceHandler, incomingEvent) => {
            controllers.euchre.setBidder(incomingEvent.trump ? sourceHandler : undefined, incomingEvent.trump || controllers.euchre.currentTrump);
            controllers.waiting.removePosition(sourceHandler);
        },
        'going-alone-response': (controllers, sourceHandler, incomingEvent) => {
            controllers.euchre.setGoingAlone(sourceHandler);
        },
        'dealer-discard-response': (controllers, sourceHandler, incomingEvent) => {
            controllers.hand.removeCards(sourceHandler, [ incomingEvent.selected ]);
            controllers.waiting.removePosition(sourceHandler);
        },
        'turn-response': (controllers, sourceHandler, incomingEvent) => {
            controllers.trick.setPlayedCard(incomingEvent.card);
            controllers.waiting.removePosition(sourceHandler);
        }
    },
});