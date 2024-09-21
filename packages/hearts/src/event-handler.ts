import { Controllers } from './controllers/controllers.js';
import { PassResponseMessage } from './messages/response/index.js';
import { ResponseMessage } from './messages/response-message.js';
import { followsTrick } from './util/follows-trick.js';
import { Suit, Card, Rank, distinct, isDefined, PlayCardResponseMessage, buildEventHandler, EventHandler } from '@cards-ts/core';

const QS = new Card(Suit.SPADES, Rank.QUEEN);

export const eventHandler = buildEventHandler<Controllers, ResponseMessage>({
    'pass-response': {
        validateEvent: {
            validators: [
                EventHandler.validate('Not all are cards', (controllers, source, { cards }) => !cards.every(isDefined)), // TODO better condition using message transformation
                EventHandler.validate('Wrong number of cards passed', (controllers, source, { cards }) => cards.length !== controllers.params.get().numToPass),
                EventHandler.validate('Cannot pass same card multiple times', (controllers, source, { cards }) => cards.filter(distinct).length !== controllers.params.get().numToPass),
                EventHandler.validate('Can only pass cards that are in hand', (controllers, source, { cards }) => cards.some(card => controllers.hand.get(source).find(card.equals.bind(card)) === undefined)),
            ],
            fallback: (controllers, source) => new PassResponseMessage(controllers.hand.get(source).slice(0, controllers.params.get().numToPass)),
        },
        merge: [
            EventHandler.removeWaiting('waiting'), 
            (controllers, sourceHandler, incomingEvent) => controllers.passing.setPassedFor(sourceHandler, incomingEvent.cards),
        ],
    },
    'turn-response': {
        canRespond: EventHandler.isTurn('turn'),
        validateEvent: {
            validators: [
                EventHandler.validate('No card provided', (controllers, source, { card }) => !card),
                EventHandler.validate('Cannot play card that is not in hand', (controllers, source, { card }) => !controllers.hand.hasCard(card, source)),
                EventHandler.validate('Cannot give points on the first round', (controllers, source, { card }) => controllers.trick.tricks === 0 && (card.suit === Suit.HEARTS || card.equals(QS))),
                EventHandler.validate('Blood has not been shed yet', (controllers, source, { card }) => controllers.trick.currentTrick[0] === undefined && card.suit === Suit.HEARTS && controllers.trickPoints.get().every(point => point === 0)),
                EventHandler.validate('Must follow suit if possible', (controllers, source, { card }) => !followsTrick(controllers.trick.currentTrick, card, controllers.hand.get(source))),
            ],
            fallback: (controllers, source, { card }) => {
                const fallbackCard = controllers.hand.get(source).filter(card => card.suit === controllers.trick.currentTrick[0]?.suit)[0] || controllers.hand.get(source).filter(card => card.suit !== Suit.HEARTS)[0] || controllers.hand.get(source)[0];
                return new PlayCardResponseMessage(fallbackCard);
            },
        },
        merge: [
            EventHandler.removeWaiting('waiting'),
            (controllers, sourceHandler, incomingEvent) => controllers.trick.setPlayedCard(incomingEvent.card),
        ],
    },
});
