import { GenericHandlerController } from '../games/generic-handler-controller.js';
import { SystemHandlerParams } from '../handlers/system-handler.js';
import { isDefined } from '../util/is-defined.js';
import { GenericControllerProvider, GlobalController } from './controller.js';

type PointsState = number[];

type PointsDependencies = {
    players: GenericHandlerController<any, SystemHandlerParams>;
};

/**
 * @category Controller Provider
 */
export class PointsControllerProvider implements GenericControllerProvider<PointsState, PointsDependencies, PointsController> {
    controller(state: PointsState, controllers: PointsDependencies): PointsController {
        return new PointsController(state, controllers);
    }

    initialState(controllers: PointsDependencies): PointsState {
        return new Array(controllers.players.count).fill(0);
    }

    dependencies() {
        return { players: true } as const;
    }
}

/**
 * Handles scores for players
 * @category Controller
 */
export class PointsController extends GlobalController<PointsState, PointsDependencies> {
    increaseScore(players: number | number[], increment: number) {
        if (Array.isArray(players)) {
            for (const player of players) {
                this.state[player] += increment;
            }
        } else {
            this.state[players] += increment;
        }
    }

    decreaseScore(players: number | number[], decrement: number) {
        if (Array.isArray(players)) {
            for (const player of players) {
                this.state[player] -= decrement;
            }
        } else {
            this.state[players] -= decrement;
        }
    }

    get(): number[];

    get(position: number): number;

    get(position?: number): number | number[] {
        return position !== undefined ? this.state[position] : this.state;
    }

    playersOver(threshold: number) {
        return this.state.map((points, index) => (points >= threshold ? index : undefined)).filter(isDefined);
    }

    reset() {
        return new Array(this.controllers.players.count).fill(0);
    }
}
