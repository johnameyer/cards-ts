import { GlobalController, GenericControllerProvider } from '@cards-ts/core';

type RoundState = number;

export class RoundControllerProvider implements GenericControllerProvider<RoundState, {}, RoundController> {
    controller(state: number, controllers: {}): RoundController {
        return new RoundController(state, controllers);
    }

    initialState() {
        return 0;
    }

    dependencies() {
        return {};
    }
}

export class RoundController extends GlobalController<RoundState, {}> {
    validate(): void {
        if(!Number.isInteger(this.state)) { 
            throw new Error('Expected number');
        }
    }
}
