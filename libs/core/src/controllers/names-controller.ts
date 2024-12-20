import { GenericControllerProvider, GlobalController } from './controller.js';

/**
 * The names of all the players
 */
type NamesState = string[];

/**
 * @category Controller Provider
 */
export class NamesControllerProvider implements GenericControllerProvider<NamesState, {}, NamesController> {
    constructor(private readonly initialNames: string[]) {
    }

    controller(state: NamesState, controllers: {}): NamesController {
        return new NamesController(state, controllers);
    }

    initialState(): NamesState {
        return this.initialNames;
    }

    dependencies() {
        return {};
    }
}

/**
 * Holds the names for the players
 * @category Controller
 */
export class NamesController extends GlobalController<NamesState, {}> {
    get(): string[];

    get(position: number): string;

    get(position?: number): string | string[] {
        return position !== undefined ? this.state[position] : this.state;
    }
    // TODO indexed global controller

    override validate() {
        if(!Array.isArray(this.state)) {
            throw new Error('Names is not an array');
        }
    }
}
