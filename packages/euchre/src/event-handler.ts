import { EventHandlerInterface, GenericGameState, PlayCardResponseMessage } from "@cards-ts/core";
import { Controllers, GameControllers } from "./controllers/controllers";
import { DealerDiscardResponseMessage, GoingAloneResponseMessage, OrderUpResponseMessage, NameTrumpResponseMessage } from "./messages/response";
import { ResponseMessage } from "./messages/response-message";
import { followsTrick } from "./util/follows-trick";

export class EventHandler implements EventHandlerInterface<GameControllers, ResponseMessage> {
    validateEvent(controllers: Controllers, source: number, event: ResponseMessage): ResponseMessage | undefined {
        // TODO shore up the logic of what events we are expecting (not just the static handler logic)
        switch(event.type) {
            case 'order-up-response': {
                if(source !== controllers.turn.get()) {
                    return undefined;
                }
                const { selectingTrump, data } = event;
                return new OrderUpResponseMessage(selectingTrump, data);
            }
            case 'name-trump-response': {
                if(source !== controllers.turn.get()) {
                    return undefined;
                }
                const { trump, data } = event;
                try {
                    if(controllers.euchre.currentTrump === trump) {
                        throw new Error('Can\'t select the current trump suit as the trump');
                    }
                    return new NameTrumpResponseMessage(trump, data);
                } catch (e) {
                    console.error('Invalid suit');
                }
                return new NameTrumpResponseMessage(undefined, event.data);
            }
            case 'going-alone-response': {
                return new GoingAloneResponseMessage(event.data);
            }
            case 'dealer-discard-response': {
                if(source !== controllers.turn.get()) {
                    return undefined;
                }
                const { selected, data } = event;
                try {
                    if(!selected) {
                        throw new Error('No card provided');
                    }

                    if(!controllers.hand.hasCard(selected, source)) {
                        throw new Error('Cannot play card that is not in hand');
                    }

                    return new DealerDiscardResponseMessage(selected, data);
                } catch (e) {
                    console.error('Invalid dealer discard', e);
                }
                
                return new DealerDiscardResponseMessage(controllers.hand.get(source)[0], data);
            }
            case 'turn-response': {
                if(source !== controllers.turn.get()) {
                    return undefined;
                }
                const { card, data } = event;
                // console.log(card.toString());
                // console.log(gameState.hands[source].sort(compare).toString());
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

                    return new PlayCardResponseMessage(card, data);
                } catch (e) {
                    console.error('Invalid turn', e);
                }

                return new PlayCardResponseMessage(controllers.hand.get(source).filter(card => followsTrick(controllers.trick.currentTrick, controllers.euchre.currentTrump, card))[0] || controllers.hand.get(source)[0], data);
            }
            case 'data-response': {
                return event;
            }
        }
    }

    merge(controllers: Controllers, sourceHandler: number, incomingEvent: ResponseMessage) {
        switch(incomingEvent.type) {
            case 'order-up-response': {
                controllers.euchre.setBidder(incomingEvent.selectingTrump ? sourceHandler : undefined);
                controllers.data.setDataFor(sourceHandler, incomingEvent.data);
                controllers.waiting.removePosition(sourceHandler);
                return;
            }
            case 'name-trump-response': {
                controllers.euchre.setBidder(incomingEvent.trump ? sourceHandler : undefined, incomingEvent.trump || controllers.euchre.currentTrump);
                controllers.data.setDataFor(sourceHandler, incomingEvent.data);
                controllers.waiting.removePosition(sourceHandler);
                return;
            }
            case 'going-alone-response': {
                controllers.euchre.setGoingAlone(sourceHandler);
                return;
            }
            case 'dealer-discard-response': {
                controllers.hand.removeCards(sourceHandler, [incomingEvent.selected]);
                controllers.data.setDataFor(sourceHandler, incomingEvent.data);
                controllers.waiting.removePosition(sourceHandler);
                return;
            }
            case 'turn-response': {
                controllers.data.setDataFor(sourceHandler, incomingEvent.data);
                controllers.trick.setPlayedCard(incomingEvent.card);
                controllers.waiting.removePosition(sourceHandler);
                return;
            }
            case 'data-response': {
                controllers.data.setDataFor(sourceHandler, incomingEvent.data);
                return;
            }
        }
    }
}