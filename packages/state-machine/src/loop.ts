import { Transition, Condition, MachineLike, NestedMachine } from './util.js';

type LoopConfig<T> = {
    id: string,
    beforeAll?: Transition<T>,
    beforeEach?: Transition<T>,
    afterEach?: Transition<T>,
    afterAll?: Transition<T>,
    breakingIf: Condition<T>,
    run: MachineLike<T>,
}

// TODO construct for looping N times w/ breaking?
export function loop<T>(config: LoopConfig<T>): NestedMachine<T> {
    const id = config.id.toUpperCase();
    // TODO shorten if we only need one of either
    const beforeAll = 'BEFORE_ALL_' + id + 'S';
    const beforeEach = 'BEFORE_EACH_' + id;
    const afterAll = 'AFTER_ALL_' + id + 'S';
    const afterEach = 'AFTER_EACH_' + id;

    return {
        start: beforeAll,
        states: {
            // TODO only include if needed
            [beforeAll]: {
                run: config.beforeAll,
                defaultTransition: beforeEach,
            },
            [beforeEach]: {
                run: config.beforeEach,
                defaultTransition: id,
            },
            [id]: {
                run: config.run,
                defaultTransition: afterEach,
            },
            [afterEach]: { // TODO do we always need an after? Should we allow states to be terminal and have conditional transitions?
                run: config.afterEach,
                transitions: [{
                    state: afterAll,
                    condition: config.breakingIf,
                }],
                defaultTransition: beforeEach,
            },
            [afterAll]: {
                run: config.afterAll,
            },
        },
    };
}
