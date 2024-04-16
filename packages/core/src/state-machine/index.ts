import { IndexedControllers, GenericHandlerController, SystemHandlerParams, WaitingController, GameStateController, TurnController } from '../index.js';

export type Transition<T> = (controllers: T) => void; // TODO rename - transition implies change of state
export type Provider<T, U> = (controllers: T) => U;
export type Condition<T> = Provider<T, boolean>;

type TransitionOptions<T, K extends string> = {
    defaultTransition: K,
    transitions?: {condition: Condition<T>, state: K}[]
}

export type StronglyTypedMachine<T, K extends string> = { // machine also needs to specify start
    start: K,
    states: {
        [state in K]: {
            run?: Transition<T>;
        } & (TransitionOptions<T, K> | {})
    }
};

/*
 * export type Named<T> = {
 *     id: string,
 *     run: T,
 * }
 */

export type Machine<T> = StronglyTypedMachine<T, string>;

export type MachineLike<T> = Transition<T> | Machine<T>;

export type NestedMachine<T> = {
    start: string,
    states: {
        [state: string]: {
            run?: MachineLike<T>;
        } & (TransitionOptions<T, string> | {})
    }
}

export function single<T>(id: string, run: Transition<T>): Machine<T> {
    return {
        start: id.toUpperCase(),
        states: {
            [id]: { run },
        },
    };
}

type LoopConfig<T> = {
    id: string,
    beforeAll?: Transition<T>,
    beforeEach?: Transition<T>,
    afterEach?: Transition<T>,
    afterAll?: Transition<T>,
    breakingIf: Condition<T>,
    afterBreak?: Transition<T>,
    run: MachineLike<T>,
}

function isMachine<T>(machine: MachineLike<T>): machine is Machine<T> {
    return 'start' in machine && 'states' in machine;
}

function asMachine<T>(machine: MachineLike<T>, defaultId: string): Machine<T> {
    if(isMachine(machine)) {
        return machine;
    }
    return {
        start: defaultId,
        states: {
            [defaultId]: {
                run: machine,
            },
        },
    };
}

/**
 * Adds a transition onto starting state
 */
function prependState<T>(machine: NestedMachine<T>, id: string, state: MachineLike<T>): NestedMachine<T> {
    return {
        start: id,
        states: {
            ...machine.states,
            [id]: {
                run: state,
                defaultTransition: machine.start,
            },
        },
    };
}

/**
 * Adds a transition onto all terminal states
 */
function appendState<T>(machine: NestedMachine<T>, transitions: TransitionOptions<T, string>): NestedMachine<T> {
    return {
        ...machine,
        states: {
            ...machine.states,
            ...Object.fromEntries(
                Object.entries(machine.states)
                    .filter(([ _, value ]) => !('defaultTransition' in value))
                    .map(([ key, value ]) => [ key, {
                        ...value,
                        ...transitions,
                    }]),
            ),
        },
    };
}

export function loop<T>(config: LoopConfig<T>): NestedMachine<T> {
    const id = config.id.toUpperCase();
    // TODO shorten if we only need one of either
    const beforeAll = 'BEFORE_ALL_' + id;
    const beforeEach = 'BEFORE_EACH_' + id;
    const afterAll = 'AFTER_ALL_' + id;
    const afterEach = 'AFTER_EACH_' + id;
    // TODO flatten?

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

function describer(i: number) {
    return [
        'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
    ][i].toUpperCase();
}

export function sequence<T>(machines: MachineLike<T>[]): NestedMachine<T> {
    return {
        start: describer(0),
        states: Object.fromEntries(machines.map((machine, i) => [ describer(i), {
            run: machine,
            defaultTransition: i + 1 in machines ? describer(i + 1) : undefined,
        }])),
    };
}

type HandleSingleConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    position: Provider<T, number>,
};

export function handleSingle<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleSingleConfig<T>): Machine<T> {
    const id = (config.handler as any as string).toUpperCase();
    const before = 'BEFORE_' + id;
    const after = 'AFTER_' + id;
    return {
        start: before,
        states: {
            [before]: {
                run: () => {},
                defaultTransition: id,
            },
            [id]: {
                run: controllers => controllers.players.handlerCall(config.position(controllers), config.handler),
                defaultTransition: after,
            },
            [after]: {
                run: () => {},
            },
        },
    };
}


// TODO how do we handle state better?
type HandleRoundRobinConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    startingPosition: Provider<T, number>,
    controller: Provider<T, TurnController>,
    // breakingAfter?
    beforeAll?: Transition<T>,
    /*
     * TODO ponder about semantics between outer *Each and inner (loop) *All
     * TODO ponder about semantics between loop *Each and inner *All / sequence
     */
    afterEach?: Transition<T>,
    breakingIf?: Condition<T>,
    /*
     * afterBreak?: Machine<T>,
     * otherwise?: Machine<T>
     */
};

export function handleRoundRobin<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleRoundRobinConfig<T>): NestedMachine<T> {
    // const {} = config;
    const id = (config.handler as any as string).toUpperCase();

    return loop({
        id,
        beforeAll: controllers => config.controller(controllers).set(config.startingPosition(controllers)),
        run: handleSingle({
            handler: config.handler,
            position: controllers => config.controller(controllers).get(),
        }),
        breakingIf: controllers => {
            if(config.breakingIf && config.breakingIf(controllers)) {
                return true; 
            }
            // breakingAfter
            if(config.startingPosition(controllers) === config.controller(controllers).get()) {
                return true; 
            }

            return false;
        },
        afterEach: controllers => config.controller(controllers).next(),
    });
}

export type StatefulControllers = IndexedControllers & { state: GameStateController<any>; waiting: WaitingController; };
