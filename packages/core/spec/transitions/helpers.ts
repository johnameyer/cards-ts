import { GenericHandlerControllerProvider } from '../../src/games/generic-handler-controller.js';
import { IndexedControllers, GenericHandlerController, SystemHandlerParams, WaitingController, GenericGameState, GameStateController, GameStateControllerProvider, STANDARD_STATES, WaitingControllerProvider, Handler } from '../../src/index.js';
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
            run: Transition<T>;
        } & (TransitionOptions<T, K> | {})
    }
};

export type Machine<T> = StronglyTypedMachine<T, string>;

export type MachineLike<T> = Transition<T> | Machine<T>;

export type NestedMachine<T> = {
    start: string,
    states: {
        [state: string]: {
            run: MachineLike<T>;
        } & (TransitionOptions<T, string> | {})
    }
}

// export function compressMachine<T>(machine: NestedMachine<T>): Machine<T> {
//     return null as any; // stub
// }

export function single<T>(id: string, run: Transition<T>): Machine<T> {
    return {
        start: id,
        states: {
            [id]: { run }
        }
    }
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
            }
        }
    };
}

/**
 * Adds a transition onto all terminal states
 */
function appendTransition<T>(machine: Machine<T>, transitions: TransitionOptions<T, string>): Machine<T> {
    return {
        ...machine,
        states: {
            ...machine.states,
            ...Object.fromEntries(
                Object.entries(machine.states)
                .filter(([_, value]) => !('defaultTransition' in value))
                .map(([key, value]) => [key, {
                    ...value,
                    ...transitions,
                }])
            )
        },
    }
}

export function loop<T>(config: LoopConfig<T>): Machine<T> {
    const id = config.id.toUpperCase()
    const before = 'BEFORE_' + id;
    const after = 'AFTER_' + id;
    // flatten function?
    const run = appendTransition(asMachine(config.run, id), { defaultTransition: after, transitions: [ {state: before, condition: config.condition} ] });

    return {
        start: before,
        states: {
            [before]: {
                run: () => {},
                defaultTransition: run.start,
            },
            ...run.states,
            [after]: {
                run: () => {},
            }
        }
    };
}

export function sequence<T>(machines: Machine<T>[]): Machine<T> {
    const start = machines[0].start;
    const states = {};
    for(let index = 0; index < machines.length - 1; index++) {
        // handle duplicates
        Object.assign(states, appendTransition(machines[index], { defaultTransition: machines[index + 1].start }).states);
    }
    Object.assign(states, machines.at(-1)?.states)
    return {
        start,
        states,
    };
}

type HandleSingleConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    position: Provider<T, number>,
};

export function handleSingle<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleSingleConfig<T>): Machine<T> {
    const id = (config.handler as any as string).toUpperCase()
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
        }
    }
}

// type HandleRoundRobinConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
//     startingPosition: Provider<T, number>,
//     beforeAll?: Transition<T>,
//     /*
//      * TODO ponder about semantics between outer *Each and inner (loop) *All
//      * TODO ponder about semantics between loop *Each and inner *All / sequence
//      */
//     afterEach?: Transition<T>,
//     breakingIf?: Condition<T>,
//     afterBreak?: Machine<T>,
//     otherwise?: Machine<T>
// };

// export function handleRoundRobin<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleConfig<T>): Machine<T> {
//     return null as any;
// }

type StatefulControllers = IndexedControllers & { state: GameStateController<any> };

/**
* Progress the state machine forward one transition
* @returns if has additional states
*/
export function advance<T extends StatefulControllers>(gameState: GenericGameState<T>, machine: Machine<T>) {
    // prevent advancing after completed
    let currentState = gameState.state.state as string;
    if(currentState == STANDARD_STATES.START_GAME) { // hack
        currentState = machine.start;
    };
    const state = machine.states[currentState];
    state.run(gameState.controllers);

    // TODO waiting
        
    if(!('defaultTransition' in state)) {
        console.log(`${currentState} => _`);

        return false;
    }
    
    const nextState = state.transitions?.find(transition => transition.condition.call(null, gameState.controllers))?.state ?? state.defaultTransition;
    
    console.log(`${currentState} => ${nextState}`);

    gameState.controllers.state.set(nextState);

    return true;
}

/**
* Progress the state machine until paused or complete
*/
export function resume<T extends StatefulControllers>(gameState: GenericGameState<T>, machine: Machine<T>) {
    // stub - runs through state machine
    while(advance(gameState, machine)) {}
}

export const buildGameState = () => new GenericGameState(Object.assign({}, mockControllerProviders, { state: new GameStateControllerProvider() }));

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
    }

    return new GenericGameState(Object.assign({}, mockControllerProviders, mockControllerProvidersWithPlayers));
}