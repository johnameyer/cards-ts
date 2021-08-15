import { Card } from '../cards/card';
import { Deck } from '../cards/deck';
import { GenericHandlerController } from '../games/generic-handler-controller';
import { SystemHandlerParams } from '../handlers/system-handler';
import { AbstractController, GenericControllerProvider } from './controller';

/**
 * The deck currently in use
 */
type DeckState = {
    deck: Deck;

    dealer: number;
    
    toDiscard?: Card | null;
}

type DeckDependencies = { players: GenericHandlerController<any, SystemHandlerParams> };

/**
 * @category Controller Provider
 */
export class DeckControllerProvider implements GenericControllerProvider<DeckState, DeckDependencies, DeckController> {
    private params;

    constructor(...params: ConstructorParameters<typeof Deck>) {
        this.params = params;
    }

    controller(state: DeckState, controllers: DeckDependencies): DeckController {
        return new DeckController(state, controllers, this.params);
    }
    
    dependencies() {
        return { players: true } as const;
    }

    initialState(): DeckState {
        return {
            deck: new Deck(...this.params),
            dealer: 0,
        };
    }
}

/**
 * Controls a deck for the game
 * @category Controller
 */
export class DeckController extends AbstractController<DeckState, DeckDependencies, Pick<DeckState, 'dealer'> & { deckCard: Card | null }> {
    constructor(state: DeckState, controllers: DeckDependencies, private readonly params: ConstructorParameters<typeof Deck>) {
        super(state, controllers);
    }
    
    get deck() {
        return this.state.deck;
    }

    get dealer() {
        return this.state.dealer;
    }

    getFor() {
        return {
            dealer: this.state.dealer,
            deckCard: this.state.deck.top,
        };
    }

    resetDeck() {
        this.state.deck = new Deck(...this.params);
    }

    incrementDealer() {
        this.state.dealer = (this.dealer + 1) % this.controllers.players.count;
    }

    discard() {
        this.deck.discard(this.state.toDiscard as Card);
    }

    get toDiscard() {
        return this.state.toDiscard;
    }

    set toDiscard(toDiscard: DeckState['toDiscard']) {
        this.state.toDiscard = toDiscard;
    }

    validate() {
        if(!Number.isInteger(this.state.dealer)) {
            throw new Error('Expected integer dealer');
        }
        if(this.state.toDiscard !== undefined && !Card.fromObj(this.state.toDiscard)) {
            throw new Error('Expected card or undefined toDiscard');
        }
        Deck.fromObj(this.state.deck);
    }
}
