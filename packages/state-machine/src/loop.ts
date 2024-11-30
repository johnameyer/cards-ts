import { Named } from './machine.js';
import { prependState } from './util.js';
import { Transition, Condition, MachineLike, NestedMachine } from './machine.js';

/**
 * @inline
 */
type LoopConfig<T> = {
    /** The core node name / suffix to use */
    id: string,
    /** The core transition to run */
    run: MachineLike<T>,
    /** The condition determining when the machine should break */
    breakingIf: Condition<T>,
    /** A transition to run before running the `run` ever */
    beforeAll?: Transition<T>,
    /** A transition to run before each time running `run` */
    beforeEach?: Transition<T>,
    /** A transition to run after each time running `run` */
    afterEach?: Transition<T>,
    /** A transition to run after breaking out */
    afterAll?: Transition<T>,
}

// TODO construct for looping N times w/ breaking?
/**
 * Creates a machine that loops the `run` machine until the condition is met
 * @typeParam T The controllers this machine will use
 * @returns The machine
 */
export function loop<T>(config: LoopConfig<T>): Named<NestedMachine<T>> {
    const name = config.id.toUpperCase();
    // TODO shorten if we only need one of either
    const beforeAll = 'BEFORE_ALL_' + name;
    const beforeEach = 'BEFORE_EACH_' + name;
    const afterAll = 'AFTER_ALL_' + name;
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
