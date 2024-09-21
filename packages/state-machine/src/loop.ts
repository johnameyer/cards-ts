import { Named } from './sequence.js';
import { Transition, Condition, MachineLike, NestedMachine, prependState } from './util.js';

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
export function loop<T>(config: LoopConfig<T>): Named<NestedMachine<T>> {
    const name = config.id.toUpperCase();
    // TODO shorten if we only need one of either
    const beforeAll = 'BEFORE_ALL_' + name + 'S';
    const beforeEach = 'BEFORE_EACH_' + name;
    const afterAll = 'AFTER_ALL_' + name + 'S';
    const afterEach = 'AFTER_EACH_' + name;
    
    // TODO should we allow states to be terminal and have conditional transitions?
    
    // beforeEach is a prefix onto id within the loop
    // afterEach transitions can be moved onto id
    
    const startLoop = config.beforeEach ? beforeEach : name;
    
    const loopTransition = {
        transitions: [{
            state: afterAll,
            condition: config.breakingIf,
        }],
        defaultTransition: startLoop,
    }
    
    let states;
    
    // TODO find simpler way to build this up - prependState?
    if(config.beforeEach) {
        if(config.afterEach) {
            states = {
                [beforeEach]: {
                    run: config.beforeEach,
                    defaultTransition: name,
                },
                [name]: {
                    run: config.run,
                    defaultTransition: afterEach,
                },
                [afterEach]: {
                    run: config.afterEach,
                    ...loopTransition,
                },
            };
        } else {
            states = {
                [beforeEach]: {
                    run: config.beforeEach,
                    defaultTransition: name,
                },
                [name]: {
                    run: config.run,
                    ...loopTransition,
                },
            };
        }
    } else {
        if(config.afterEach) {
            states = {
                [name]: {
                    run: config.run,
                    defaultTransition: afterEach,
                },
                [afterEach]: {
                    run: config.afterEach,
                    ...loopTransition,
                },
            };
        } else {
            states = {
                [name]: {
                    run: config.run,
                    ...loopTransition,
                },
            };
        }
    }
    
    const core = {
        name,
        start: startLoop,
        states: {
            ...states,
            [afterAll]: {
                run: config.afterAll,
            },
        },
    }
    
    if(config.beforeAll) {
        return {
            name,
            ...prependState(core, beforeAll, config.beforeAll),
        };
    }
    
    return core;
}
