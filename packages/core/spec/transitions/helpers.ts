import { GenericHandlerControllerProvider } from '../../src/games/generic-handler-controller.js';
import { IndexedControllers, GenericHandlerController, SystemHandlerParams, WaitingController, GenericGameState, GameStateController, GameStateControllerProvider, STANDARD_STATES, WaitingControllerProvider, Handler, GameDriver } from '../../src/index.js';
import { MockController, mockControllerProviders } from '../mock-controller.js';
import { Params, mockHandlerProxy } from '../mock-handler-proxy.js';

export type Transition<T> = (controllers: T) => void;
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

/*
 * export function compressMachine<T>(machine: NestedMachine<T>): Machine<T> {
 *     return null as any; // stub
 * }
 */

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
    beforeEach?: Transition<T>,
    afterEach?: Transition<T>,
    condition: Condition<T>,
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
    const before = 'BEFORE_' + id;
    const after = 'AFTER_' + id;
    // TODO flatten?

    return {
        start: before,
        states: {
            // TODO wire these based on beforeEach / afterAll
            [before]: {
                defaultTransition: id,
            },
            [id]: {
                run: config.run,
                transitions: [{
                    state: id,
                    condition: config.condition,
                }],
                defaultTransition: after,
            },
            [after]: { // TODO do we always need an after? Should we allow states to be terminal and have conditional transitions?
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
// type HandleRoundRobinConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
//     handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
//     position: Provider<T, number>,
//     beforeAll?: Transition<T>,
//     /*
//      * TODO ponder about semantics between outer *Each and inner (loop) *All
//      * TODO ponder about semantics between loop *Each and inner *All / sequence
//      */
//     afterEach?: Transition<T>,
//     /*
//      * breakingIf?: Condition<T>,
//      * afterBreak?: Machine<T>,
//      * otherwise?: Machine<T>
//      */
// };

// export function handleRoundRobin<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleRoundRobinConfig<T>): NestedMachine<T> {
//     const id = (config.handler as any as string).toUpperCase();
//     let machine: NestedMachine<T> = {
//         start: id,
//         states: {
//             [id]: {
//                 run: controllers => controllers.players.handlerCall(config.position(controllers), config.handler),
//             },
//         },
//     };

//     if(config.beforeAll) {
//         machine = prependState(machine, `BEFORE_ALL_${id}`, config.beforeAll);
//     }

//     return machine;
// }

type StatefulControllers = IndexedControllers & { state: GameStateController<any>; waiting: WaitingController; };

/**
 * Progress the state machine forward one transition
 * @returns if can continue at this time
 */
export function advance<T extends StatefulControllers>(gameState: GenericGameState<T>, machine: NestedMachine<T>) {
    // TODO prevent advancing after completed

    if(GameDriver.isWaitingOnPlayer(gameState.controllers.waiting)) { // TODO clean this up
        return false;
    }

    let currentState = gameState.state.state as string;
    if(currentState === STANDARD_STATES.START_GAME) { // hack
        currentState = JSON.stringify([ machine.start ]);
    }
    const unnested: string[] = JSON.parse(currentState);

    const deepFindState = (state: string[], machine: NestedMachine<T>): NestedMachine<T>['states']['run'] => {
        const level = machine.states[state[0]];
        // do we need to be particular about mismatches here?
        if(state.length === 1) {
            return level;
        }
        return deepFindState(state.slice(1), level.run as Machine<T>);
    };

    const state = deepFindState(unnested, machine);

    if(typeof state.run === 'object') {
        // push state
        unnested.push(state.run.start);
    } else {
        if(state.run) {
            state.run(gameState.controllers);
        }

        unnested.pop();

        if(!('defaultTransition' in state) || !state.defaultTransition) {
            state;
            if(unnested.length === 0) {
                gameState.controllers.state.set(STANDARD_STATES.END_GAME);
    
                // console.log(`${currentState} => _`);
    
                return false;
            }
        } else {
            const nextState = state.transitions?.find(transition => transition.condition.call(null, gameState.controllers))?.state ?? state.defaultTransition;

            unnested.push(nextState);
        }
    } 

    // TODO waiting
    const nextState = JSON.stringify(unnested);

    // console.log(`${currentState} => ${nextState}`);

    gameState.controllers.state.set(nextState);

    return true;
}

/**
 * Progress the state machine until paused or complete
 */
export function resume<T extends StatefulControllers>(gameState: GenericGameState<T>, machine: NestedMachine<T>) {
    // stub - runs through state machine
    while(advance(gameState, machine)) {}
}

export const buildGameState = () => new GenericGameState({ ...mockControllerProviders, state: new GameStateControllerProvider(), waiting: new WaitingControllerProvider() });

export type MockControllers = {
    count: MockController,
}

export type MockControllersWithPlayers = {
    count: MockController,
    waiting: WaitingController,
    players: GenericHandlerController<any, Params>,
}

export function buildGameStateWithPlayers(handlers: Handler<Params, any, any>[]) {
    const handlerProxy = mockHandlerProxy(handlers);

    const mockControllerProvidersWithPlayers = {
        waiting: new WaitingControllerProvider(),
        players: new GenericHandlerControllerProvider<any, Params>(handlerProxy),
        state: new GameStateControllerProvider(),
    };

    return new GenericGameState({ ...mockControllerProviders, ...mockControllerProvidersWithPlayers });
}
