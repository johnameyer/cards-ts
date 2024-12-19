import { GenericControllerProvider, GlobalController } from '../../src/index.js';

export type MockState = number;

export class MockControllerProvider implements GenericControllerProvider<MockState, {}, MockController> {
    controller(state: MockState, controllers: {}): MockController {
        return new MockController(state, controllers);
    }

    initialState(): MockState {
        return 0;
    }

    dependencies() {
        return { } as const;
    }
}

export class MockController extends GlobalController<MockState, {}> {
    add(i: number) {
        this.state += i;
    }
}

export const mockControllerProviders = {
    mock: new MockControllerProvider(),
};
