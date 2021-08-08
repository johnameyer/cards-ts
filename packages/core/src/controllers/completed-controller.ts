import { GenericControllerProvider, GlobalController } from "./controller";

/**
 * Whether the game is completed
 */
type CompletedState = boolean;

export class CompletedControllerProvider implements GenericControllerProvider<CompletedState, {}, CompletedController> {
    controller(state: CompletedState, controllers: {}): CompletedController {
        return new CompletedController(state, controllers);
    }

    initialState(): CompletedState {
        return false;
    }

    dependencies() {
        return {};
    }
}

export class CompletedController extends GlobalController<CompletedState, {}> {
    get() {
        return this.state;
    }

    complete() {
        this.state = true;
    }

    override validate() {
        if(this.state !== true && this.state !== false) {
            throw new Error('Expected boolean');
        }
    }
}