import { GenericControllerProvider, GlobalController } from './controller';

/**
 * The names of all the players
 */
type NamesState = string[];

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

export class NamesController extends GlobalController<NamesState, {}> {
    get(): string[];

    get(position: number): string;

    get(position?: number): string | string[] {
        return position !== undefined ? this.state[position] : this.state;
    }

    override validate() {
        if(!Array.isArray(this.state)) {
            throw new Error('Names is not an array');
        }
    }
}
