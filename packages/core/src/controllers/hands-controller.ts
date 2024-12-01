import { Card } from '../cards/card.js';
import { GenericHandlerController } from '../games/generic-handler-controller.js';
import { SystemHandlerParams } from '../handlers/system-handler.js';
import { Serializable } from '../intermediary/serializable.js';
import { DealtOutMessage } from '../messages/status/index.js';
import { AbstractController, GenericControllerProvider } from './controller.js';
import { DeckController } from './deck-controller.js';

/**
 * The cards of all hands
 */
type HandsState = Card[][];

type HandDependencies = {
    deck: DeckController;
    players: GenericHandlerController<any, SystemHandlerParams>;
};

/**
 * Handles state for players' hands
 * Has children classes that allow for hiding and showing the hands to handlers
 * @category Controller
 */
export abstract class AbstractHandsController<HandlerType extends Serializable> extends AbstractController<HandsState, HandDependencies, HandlerType> {
    override validate() {
        if(!Array.isArray(this.state)) {
            throw new Error('Hands is not an array');
        }
    }

    /*
     * TODO remove shouldShuffle
     * TODO use shouldAnnounceDealer
     */
    public dealOut(shouldMessage = true, shouldAnnounceDealer = false, numCards = -1) {
        // TODO shouldAnnounceDealer names controller
        const deck = this.controllers.deck.deck;
        while(deck.cards.length && numCards !== 0) {
            for(let j = 0; j < this.controllers.players.count; j++) {
                const player = (j + this.controllers.deck.dealer) % this.controllers.players.count;
                this.giveCards(player, [ deck.draw() ]);
            }
            numCards--;
        }
        if(shouldMessage) {
            for(let player = 0; player < this.controllers.players.count; player++) {
                this.controllers.players.message(player, new DealtOutMessage(this.get(player)));
            }
        }
    }

    public removeCards(position: number, cards: readonly Card[]) {
        for(const card of cards) {
            const index = this.state[position].findIndex(card.equals.bind(card));
            if(index < 0) {
                throw new Error('Cannot find card');
            }
            this.state[position].splice(index, 1);
        }
    }

    public giveCards(position: number, cards: Card[]) {
        this.state[position].push(...cards);
    }

    public numberOfPlayersWithCards() {
        return this.state.filter(player => player.length).length;
    }

    public handWithMostCards() {
        return this.state.reduce<[number, number]>(([ index, count ], cards, newIndex) => cards.length > count ? [ newIndex, cards.length ] : [ index, count ], [ 0, 0 ])[0];
    }

    public shift(position: number) {
        return this.state[position].shift();
    }

    get(): Card[][];

    get(position: number): Card[];

    get(position?: number): Card[] | Card[][] {
        return position !== undefined ? this.state[position] : this.state;
    }
    
    hasCard(card: Card): number;

    hasCard(card: Card, position: number): boolean;

    hasCard(card: Card, position?: number): number | boolean {
        if(position !== undefined) {
            return this.state[position].findIndex(card.equals.bind(card)) >= 0;
        }
        return this.state.findIndex(hand => hand.find(card.equals.bind(card)) !== undefined);
    }

    hasCards(cards: readonly Card[], position: number) {
        for(const card of cards) {
            if(!this.hasCard(card, position)) {
                return false;
            }
        }
        return true;
    }

    reset() {
        this.state = new Array(this.controllers.players.count).fill(undefined)
            .map(() => []);
    }
}

/**
 * @category Controller Provider
 */
abstract class AbstractHandsControllerProvider<HandsController extends AbstractHandsController<any>> implements GenericControllerProvider<HandsState, HandDependencies, HandsController> {
    abstract controller(state: HandsState, controllers: HandDependencies): HandsController;

    initialState(controllers: HandDependencies): HandsState {
        return new Array(controllers.players.count).fill(undefined)
            .map(() => []);
    }

    dependencies() {
        return { deck: true, players: true } as const;
    }
}

/**
 * @category Controller Provider
 */
export class HandsControllerProvider extends AbstractHandsControllerProvider<HandsController> {
    controller(state: HandsState, controllers: HandDependencies): HandsController {
        return new HandsController(state, controllers);
    }
}

/**
 * Handles state for players' hands and shows it to handlers
 * @category Controller
 */
export class HandsController extends AbstractHandsController<Card[]> {
    getFor(position: number) {
        return this.state[position];
    }
}

/**
 * @category Controller Provider
 */
export class HiddenHandsControllerProvider extends AbstractHandsControllerProvider<HiddenHandsController> {
    controller(state: HandsState, controllers: HandDependencies): HiddenHandsController {
        return new HiddenHandsController(state, controllers);
    }
}

/**
 * Handles state for players' hands but keeps it hidden from handlers
 * @category Controller
 */
export class HiddenHandsController extends AbstractHandsController<undefined> {
    getFor() {
        return undefined;
    }
}
