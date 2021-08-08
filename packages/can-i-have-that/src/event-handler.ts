import { Card, InvalidError, EventHandlerInterface, distinct, DiscardResponseMessage } from "@cards-ts/core";
import { Controllers } from "./controllers/controllers";
import { WantCardResponseMessage, PlayResponseMessage, GoDownResponseMessage } from "./messages/response";
import { ResponseMessage } from "./messages/response-message";

export class EventHandler implements EventHandlerInterface<Controllers, ResponseMessage> {
    validateEvent(controllers: Controllers, source: number, event: ResponseMessage): ResponseMessage | undefined {
        // console.log(Object.fromEntries(Object.entries(event).map(([key, value]) => [key, value?.toString()])));
        switch(event.type) {
            case 'discard-response': {
                if(source !== controllers.turn.get()) {
                    return undefined;
                }
                if(controllers.deck.toDiscard) {
                    return undefined;
                }
                try {
                    if (!controllers.hand.hasCard(event.toDiscard, controllers.turn.get())) {
                        throw new Error('Card is not in hand');
                    }

                    for (const plays of controllers.melds.get()) {
                        for(const run of plays) {
                            if(run.isLive(event.toDiscard)) {
                                throw new InvalidError('Card ' + event.toDiscard.toString() + ' is live on ' + run.toString());
                            }
                        }
                    }

                    return new DiscardResponseMessage(event.toDiscard, event.data);
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
            }
            case 'play-response': {
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

                    return new PlayResponseMessage(event.playOn, validToPlay, event.newMeld, event.data);
                } catch (e) {
                    console.error(e);
                }
                return undefined;
            }
            case 'go-down-response': {
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
                    return new GoDownResponseMessage(event.toPlay, event.data);
                } catch (e) {
                    console.error(e);
                }
                return undefined;
            }
            case 'want-card-response': {
                if(source !== controllers.ask.get()) {
                    // TODO allow people to say they want card ahead of time
                    return undefined;
                }
                return new WantCardResponseMessage(event.wantCard, event.data);
            }
            case 'data-response': {
                return event;
            }
        }
    }

    merge(controllers: Controllers, source: number, incomingEvent: ResponseMessage) {
        switch(incomingEvent.type) {
            case 'want-card-response': {
                controllers.canIHaveThat.wantCard = incomingEvent.wantCard;
                controllers.data.setDataFor(source, incomingEvent.data);
                controllers.waiting.removePosition(source);
                return;
            }
            case 'discard-response': {
                if(!controllers.hand.hasCard(incomingEvent.toDiscard, controllers.turn.get())) {
                    throw new Error('Player did not have card ' + incomingEvent.toDiscard);
                }
                controllers.hand.removeCards(controllers.turn.get(), [incomingEvent.toDiscard]);
                controllers.deck.toDiscard = incomingEvent.toDiscard;
                controllers.data.setDataFor(source, incomingEvent.data);
                controllers.waiting.removePosition(source);
                return;
            }
            case 'go-down-response': {
                // TODO full logic
                // TODO what lives here vs in the handleTurn function?
                const toPlay = incomingEvent.toPlay.flatMap(meld => meld.cards).filter(distinct);

                if(!controllers.hand.hasCards(toPlay, controllers.turn.get())) {
                    throw new Error('Player did not have all the cards');
                }
                controllers.hand.removeCards(controllers.turn.get(), toPlay);
                
                controllers.melds.play(incomingEvent.toPlay);
                
                controllers.data.setDataFor(source, incomingEvent.data);
                controllers.waiting.removePosition(source);
                return;
            }
            case 'play-response': {
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

                controllers.data.setDataFor(source, incomingEvent.data);
                controllers.waiting.removePosition(source);
                return;
            }
            case 'data-response': {
                controllers.data.setDataFor(source, incomingEvent.data);
                return;
            }
        }
    }
}