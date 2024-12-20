import { GenericControllerProvider, GlobalController } from '@cards-ts/core';

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
        // console.log(`this.state (${this.state}) += ${i}`);
        this.state += i;
    }
}

export const mockControllerProviders = {
    mock: new MockControllerProvider(),
};
