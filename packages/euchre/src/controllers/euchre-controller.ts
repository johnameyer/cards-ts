import { AbstractHandsController, Card, DeckController, GenericControllerProvider, GenericHandlerController, GlobalController, Serializable, Suit, SystemHandlerParams } from '@cards-ts/core';
import { GameHandlerParams } from '../game-handler-params';
import { ResponseMessage } from '../messages/response-message';

export interface EuchreState {
    [key: string]: Serializable;

    flippedCard: Card;

    currentTrump: Suit;

    bidder: number | undefined;

    goingAlone: number | undefined;
}

type EuchreDependencies = { deck: DeckController, hand: AbstractHandsController<any>, players: GenericHandlerController<ResponseMessage, GameHandlerParams & SystemHandlerParams> };

export class EuchreControllerProvider implements GenericControllerProvider<EuchreState, EuchreDependencies, EuchreController> {
    controller(state: EuchreState, controllers: EuchreDependencies): EuchreController {
        return new EuchreController(state, controllers);
    }
    
    initialState(): EuchreState {
        return {
            bidder: undefined,
            currentTrump: undefined as any as Suit,
            flippedCard: undefined as any as Card,
            goingAlone: undefined,
        };
    }

    dependencies() {
        return { deck: true, hand: true, players: true } as const;
    }
}

export class EuchreController extends GlobalController<EuchreState, EuchreDependencies> {
    validate() {
    }
    
    get bidder() {
        return this.state.bidder;
    }

    get flippedCard() {
        return this.state.flippedCard;
    }

    get goingAlone() {
        return this.state.goingAlone;
    }

    get currentTrump() {
        return this.state.currentTrump;
    }

    setGoingAlone(goingAlone: number) {
        this.state.goingAlone = goingAlone;
    }

    setBidder(bidder?: number, trump?: Suit) {
        if(bidder) {
            this.state.bidder = bidder;
        }
        if(trump) {
            this.state.currentTrump = trump;
        }
    }

    flip() {
        this.state.flippedCard = this.controllers.deck.deck.flip();
        this.state.currentTrump = this.state.flippedCard.suit;
    }

    reset() {
        this.state = new EuchreControllerProvider().initialState();
    }
}
