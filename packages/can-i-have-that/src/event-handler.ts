import { Controllers } from './controllers/controllers.js';
import { GoDownResponseMessage, PlayResponseMessage, WantCardResponseMessage } from './messages/response/index.js';
import { ResponseMessage } from './messages/response/index.js';
import { Card, distinct, DiscardResponseMessage, buildEventHandler, EventHandler } from '@cards-ts/core';

export const eventHandler = buildEventHandler<Controllers, ResponseMessage>({
    'discard-response': {
        canRespond: [
            EventHandler.isTurn('turn'),
            (controllers) => !controllers.deck.toDiscard,
        ],
        validateEvent: {
            validators: [
                EventHandler.validate('Card is not in hand', (controllers, source, event) => !controllers.hand.hasCard(event.toDiscard, controllers.turn.get())),
                EventHandler.validate('Card is live on run', (controllers, source, event) => controllers.melds.isCardLive(event.toDiscard)),
                // 'Card ' + event.toDiscard.toString() + ' is live on ' + run.toString()
            ],
            fallback: (controllers, source, event) => {
                const liveForNone = (card: Card) => !controllers.melds.isCardLive(card);
                const possibleDiscard = controllers.hand.get(source).find(liveForNone);
                
                if(!possibleDiscard) {
                    throw new Error('No possible discard?');
                    // TODO
                }
                
                return new DiscardResponseMessage(possibleDiscard);
            },
        },
        merge: (controllers, source, incomingEvent) => {
            if(!controllers.hand.hasCard(incomingEvent.toDiscard, controllers.turn.get())) {
                throw new Error('Player did not have card ' + incomingEvent.toDiscard);
            }
            controllers.hand.removeCards(controllers.turn.get(), [ incomingEvent.toDiscard ]);
            controllers.deck.toDiscard = incomingEvent.toDiscard;
            controllers.waiting.removePosition(source);
        },
        transform: event => new DiscardResponseMessage(event.toDiscard),
    },
    'play-response': {
        canRespond: EventHandler.isTurn('turn'),
        validateEvent: {
            validators: (controllers, source, event) => {
                const cardsToPlay = event.toPlay;
                const oldMeld = event.playOn.clone();
                
                let found = false;
                for(let player = 0; player < controllers.players.count; player++) {
                    for(let meld = 0; meld < controllers.melds.get()[player].length; meld++) {
                        // TODO could there be multiple equivalent?
                        if(controllers.melds.get()[player][meld] && oldMeld.cards.every(card => controllers.melds.get()[player][meld].cards.find(card.equals.bind(card)) !== undefined)) {
                            found = true;
                            break;
                        }
                    }
                    if(found) {
                        break;
                    }
                }
                if(!found) {
                    return new Error('Could not find played-on meld');
                }
            },
        },
        merge: (controllers, source, incomingEvent) => {
            const toPlay = incomingEvent.toPlay.filter(distinct);
            const oldMeld = incomingEvent.playOn;
            const newMeld = incomingEvent.newMeld;
            
            controllers.hand.removeCards(controllers.turn.get(), toPlay);
            
            let player = 0;
            let meld = 0;
            let found = false;
            for(; player < controllers.players.count; player++) {
                for(meld = 0; meld < controllers.melds.get()[player].length; meld++) {
                    // TODO could there be multiple equivalent?
                    if(controllers.melds.get()[player][meld] && oldMeld.cards.every(card => controllers.melds.get()[player][meld].cards.find(card.equals.bind(card)) !== undefined)) {
                        found = true;
                        break;
                    }
                }
                if(found) {
                    break;
                }
            }
            if(!found) {
                throw new Error('Could not find played-on meld');
            }
            
            controllers.melds.toPlayOnOthers[player] = controllers.melds.toPlayOnOthers[player] || [];
            controllers.melds.toPlayOnOthers[player][meld] = controllers.melds.toPlayOnOthers[player][meld] || [];
            controllers.melds.get()[player][meld] = newMeld;
            // TODO roll all of this into controller and add verification
            
            controllers.waiting.removePosition(source);
        },
        transform: event => new PlayResponseMessage(event.playOn, event.toPlay, event.newMeld),
    },
    'go-down-response': {
        canRespond: EventHandler.isTurn('turn'),
        validateEvent: {
            validators: [
                EventHandler.validate('Player has already gone down', (controllers, source, event) => controllers.melds.toPlay.length > 0),
                EventHandler.hasCards('hand', ({ toPlay }) => toPlay.flatMap(meld => meld.cards)),
            ],
        },
        merge: (controllers, source, incomingEvent) => {
            /*
             * TODO full logic
             * TODO what lives here vs in the handleTurn function?
             */
            const toPlay = incomingEvent.toPlay.flatMap(meld => meld.cards).filter(distinct);
            
            controllers.hand.removeCards(controllers.turn.get(), toPlay);
            
            controllers.melds.play(incomingEvent.toPlay);
            
            controllers.waiting.removePosition(source);
        },
        transform: event => new GoDownResponseMessage(event.toPlay),
    },
    'want-card-response': {
        canRespond: EventHandler.isWaiting('waiting'), // TODO allow people to say they want card ahead of time,
        validateEvent: (controllers, source, event) => {
            return new WantCardResponseMessage(event.wantCard);
        },
        merge: [
            (controllers, source, incomingEvent) => controllers.canIHaveThat.wantCard = incomingEvent.wantCard,
            EventHandler.removeWaiting('waiting'),
        ],
        transform: event => new WantCardResponseMessage(event.wantCard),
    },
});
