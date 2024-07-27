import { Controllers } from './controllers/controllers.js';
import { DealerDiscardResponseMessage, GoingAloneResponseMessage, OrderUpResponseMessage, NameTrumpResponseMessage } from './messages/response/index.js';
import { ResponseMessage } from './messages/response-message.js';
import { followsTrick } from './util/follows-trick.js';
import { PlayCardResponseMessage, EventHandler, buildEventHandler } from '@cards-ts/core';

export const eventHandler = buildEventHandler<Controllers, ResponseMessage>({
    canRespond: {
        /*
         * TODO key off waiting?
         * TODO make even shorter hand?
         */
        'order-up-response': EventHandler.isTurn('turn'),
        'name-trump-response': EventHandler.isTurn('turn'),
        'dealer-discard-response': EventHandler.isTurn('turn'),
        'turn-response': EventHandler.isTurn('turn'),
    },
    validateEvent: {
        // TODO shore up the logic of what events we are expecting (not just the static handler logic)
        'order-up-response': (controllers, source, { selectingTrump }) => {
            return new OrderUpResponseMessage(selectingTrump);
        },
        'name-trump-response': {
            validators: EventHandler.validate('Can\'t select the current trump suit as the trump', (controllers, _source, { trump }) => controllers.euchre.currentTrump === trump),
            fallback: () => new NameTrumpResponseMessage(undefined),
        },
        // TODO wrap response if somehow not proper object?
        'going-alone-response': (_controllers, _source, _incomingEvent) => {
            return new GoingAloneResponseMessage();
        },
        'dealer-discard-response': {
            validators: [
                EventHandler.validate('No card provided', (_controllers, _source, { selected }) => !selected),
                EventHandler.validate('Cannot play card that is not in hand', (controllers, source, { selected }) => !controllers.hand.hasCard(selected, source)),
            ],
            fallback: (controllers, source) => new DealerDiscardResponseMessage(controllers.hand.get(source)[0]),
        },
        'turn-response': {
            validators: [
                EventHandler.validate('No card provided', (controllers, source, { card }) => !card),
                EventHandler.validate('Cannot play card that is not in hand', (controllers, source, { card }) => !controllers.hand.hasCard(card, source)),
                EventHandler.validate('Must follow suit if possible', (controllers, source, { card }) => controllers.trick.currentTrick.some(card => card) && !followsTrick(controllers.trick.currentTrick, controllers.euchre.currentTrump, card) && controllers.hand.get(source).some(card => followsTrick(controllers.trick.currentTrick, controllers.euchre.currentTrump, card))),
            ],
            fallback: (controllers, source) => new PlayCardResponseMessage(controllers.hand.get(source).filter(card => followsTrick(controllers.trick.currentTrick, controllers.euchre.currentTrump, card))[0] || controllers.hand.get(source)[0]),
        },
    },
    merge: {
        'order-up-response': [
            EventHandler.removeWaiting('waiting'),
            (controllers, sourceHandler, incomingEvent) => controllers.euchre.setBidder(incomingEvent.selectingTrump ? sourceHandler : undefined),
        ],
        'name-trump-response': [
            EventHandler.removeWaiting('waiting'),
            (controllers, sourceHandler, incomingEvent) => controllers.euchre.setBidder(incomingEvent.trump ? sourceHandler : undefined, incomingEvent.trump || controllers.euchre.currentTrump),
        ],
        'going-alone-response': (controllers, sourceHandler, incomingEvent) => {
            controllers.euchre.setGoingAlone(sourceHandler);
        },
        'dealer-discard-response': [
            EventHandler.removeWaiting('waiting'), 
            (controllers, sourceHandler, incomingEvent) => controllers.hand.removeCards(sourceHandler, [ incomingEvent.selected ]),
        ],
        'turn-response': [
            EventHandler.removeWaiting('waiting'), 
            (controllers, sourceHandler, incomingEvent) => controllers.trick.setPlayedCard(incomingEvent.card),
        ],
    },
});
