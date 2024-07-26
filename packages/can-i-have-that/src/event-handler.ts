import { Controllers } from './controllers/controllers.js';
import { WantCardResponseMessage, PlayResponseMessage, GoDownResponseMessage } from './messages/response/index.js';
import { ResponseMessage } from './messages/response-message.js';
import { Card, InvalidError, distinct, DiscardResponseMessage, wrapEventHandler } from '@cards-ts/core';

export const eventHandler = wrapEventHandler<Controllers, ResponseMessage>({
    validateEvent: {
        'discard-response': (controllers, source, event) => {
            if(source !== controllers.turn.get()) {
                return undefined;
            }
            if(controllers.deck.toDiscard) {
                return undefined;
            }
            try {
                if(!controllers.hand.hasCard(event.toDiscard, controllers.turn.get())) {
                    throw new Error('Card is not in hand');
                }

                for(const plays of controllers.melds.get()) {
                    for(const run of plays) {
                        if(run.isLive(event.toDiscard)) {
                            throw new InvalidError('Card ' + event.toDiscard.toString() + ' is live on ' + run.toString());
                        }
                    }
                }

                return new DiscardResponseMessage(event.toDiscard);
            } catch (e) {
                console.error(e);
            }
            const liveForNone = (card: Card) => !controllers.melds.isCardLive(card);
            const possibleDiscard = controllers.hand.get(source).find(liveForNone);

            if(!possibleDiscard) {
                throw new Error('No possible discard?');
                // TODO
            }

            return new DiscardResponseMessage(possibleDiscard);
        },
        'play-response': (controllers, source, event) => {
            if(source !== controllers.turn.get()) {
                return undefined;
            }
            try {
                const cardsToPlay = event.toPlay;
                const validToPlay: Card[] = cardsToPlay;
                const oldMeld = event.playOn.clone();
                const newMeld = event.newMeld.clone();

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
                    throw new Error('Could not find played-on meld');
                }

                return new PlayResponseMessage(event.playOn, validToPlay, event.newMeld);
            } catch (e) {
                console.error(e);
            }
            return undefined;
        },
        'go-down-response': (controllers, source, event) => {
            if(source !== controllers.turn.get()) {
                return undefined;
            }
            try {
                if(controllers.melds.toPlay.length) {
                    throw new Error('Player has already gone down');
                }
                // TODO handle duplicate cards?
                if(!controllers.hand.hasCards(event.toPlay.flatMap(meld => meld.cards), controllers.turn.get())) {
                    throw new Error('Player did not have all the cards');
                }
                return new GoDownResponseMessage(event.toPlay);
            } catch (e) {
                console.error(e);
            }
            return undefined;
        },
        'want-card-response': (controllers, source, event) => {
            if(source !== controllers.ask.get()) {
                // TODO allow people to say they want card ahead of time
                return undefined;
            }
            return new WantCardResponseMessage(event.wantCard);
        }
    },

    merge: {
        'want-card-response': (controllers, source, incomingEvent) => {
            controllers.canIHaveThat.wantCard = incomingEvent.wantCard;
            controllers.waiting.removePosition(source);
        },
        'discard-response': (controllers, source, incomingEvent) => {
            if(!controllers.hand.hasCard(incomingEvent.toDiscard, controllers.turn.get())) {
                throw new Error('Player did not have card ' + incomingEvent.toDiscard);
            }
            controllers.hand.removeCards(controllers.turn.get(), [ incomingEvent.toDiscard ]);
            controllers.deck.toDiscard = incomingEvent.toDiscard;
            controllers.waiting.removePosition(source);
        },
        'go-down-response': (controllers, source, incomingEvent) => {
            /*
             * TODO full logic
             * TODO what lives here vs in the handleTurn function?
             */
            const toPlay = incomingEvent.toPlay.flatMap(meld => meld.cards).filter(distinct);

            if(!controllers.hand.hasCards(toPlay, controllers.turn.get())) {
                throw new Error('Player did not have all the cards');
            }
            controllers.hand.removeCards(controllers.turn.get(), toPlay);
                
            controllers.melds.play(incomingEvent.toPlay);
                
            controllers.waiting.removePosition(source);
        },
        'play-response': (controllers, source, incomingEvent) => {
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
        }
    },
});