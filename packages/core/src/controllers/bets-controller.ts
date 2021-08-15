import { GenericControllerProvider, GlobalController } from './controller';

type BetsState = number[];

/**
 * @category Controller Provider
 */
export class BetsControllerProvider implements GenericControllerProvider<BetsState, {}, BetsController> {
    initialState() {
        return [];
    }

    dependencies() {
        return {};
    }

    controller(state: BetsState, controllers: {}) {
        return new BetsController(state, controllers);
    }
}

/**
 * Stores bets for players
 * @category Controller
 */
export class BetsController extends GlobalController<BetsState, {}> {
    increaseBet(player: number, increment: number) {
        this.state[player] += increment;
    }

    override validate(): void {
        if(!Array.isArray(this.state)) { 
            throw new Error('Expected array');
        }
        if(this.state.some(bet => !Number.isInteger(bet))) {
            throw new Error('Expected array of numbers');
        }
    }
}
