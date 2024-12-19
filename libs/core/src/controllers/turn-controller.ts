import { GenericHandlerController } from '../games/generic-handler-controller.js';
import { SystemHandlerParams } from '../handlers/system-handler.js';
import { GenericControllerProvider, GlobalController } from './controller.js';

type TurnState = number;

type TurnDependencies = {
    players: GenericHandlerController<any, SystemHandlerParams>;
};

/**
 * @category Controller Provider
 */
export class TurnControllerProvider implements GenericControllerProvider<TurnState, TurnDependencies, TurnController> {
    controller(state: TurnState, controllers: TurnDependencies): TurnController {
        return new TurnController(state, controllers);
    }

    initialState(): TurnState {
        return 0;
    }

    dependencies() {
        return { players: true } as const;
    }
}

/**
 * Controls state around whose turn it is for something
 * @category Controller
 */
export class TurnController extends GlobalController<TurnState, TurnDependencies> {
    get() {
        return this.state;
    }

    next() {
        this.state = (this.state + 1) % this.controllers.players.count;
    }

    set(turn: number) {
        this.state = turn;
    }
}
