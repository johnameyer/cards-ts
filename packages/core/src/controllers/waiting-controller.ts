import { GenericControllerProvider, GlobalController } from "./controller";

type WaitingState = {
    /**
     * Field indicating who the game is waiting on, whether it be a number of players or some specific players (by position)
     */
    waiting: number | number[];

    /**
     * Field indicating which of the hands have already responded
     */
    responded: number[];
}

export class WaitingControllerProvider implements GenericControllerProvider<WaitingState, {}, WaitingController> {
    controller(state: WaitingState, controllers: {}): WaitingController {
        return new WaitingController(state, controllers);
    }

    initialState(): WaitingState {
        return {
            waiting: [],
            responded: []  
        };
    }

    dependencies() {
        return {};
    }
}

export class WaitingController extends GlobalController<WaitingState, {}> {
    set(waitFor: WaitingState['waiting']) {
        this.state.waiting = waitFor;
        this.state.responded = [];
    }

    get() {
        return Object.freeze({...this.state});
    }

    removePosition(position: number) {
        if(!Array.isArray(this.state.waiting)) {
            throw new Error('waiting is not an array, got: ' + this.state.waiting);
        }
        this.state.waiting.splice(this.state.waiting.indexOf(position), 1);
        this.state.responded.push(position);
    }
}