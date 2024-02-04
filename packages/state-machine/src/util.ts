import { GenericGameStateTransitions, STANDARD_STATES, IndexedControllers, GameStateController, WaitingController, CompletedController } from '@cards-ts/core';

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

export type MachineLike<T> = Transition<T> | NestedMachine<T>;

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

function isMachine<T>(machine: MachineLike<T>): machine is Machine<T> {
    return 'start' in machine && 'states' in machine;
}

function asMachine<T>(machine: MachineLike<T>, defaultId: string): NestedMachine<T> {
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
                    .filter(([ _, value ]) => !('defaultTransition' in value && value.defaultTransition))
                    .map(([ key, value ]) => [ key, {
                        ...value,
                        ...transitions,
                    }]),
            ),
        },
    };
}

function renameNode<T>(machine: NestedMachine<T>, oldNode: string, newNode: string): NestedMachine<T> {
    let newMachine = { start: machine.start, states: { ...machine.states }};

    if(machine.start === oldNode) {
        newMachine.start = newNode;
    }

    newMachine.states[newNode] = newMachine.states[oldNode];
    delete newMachine.states[oldNode];

    newMachine = repointTransition(newMachine, oldNode, newNode);

    return newMachine;
}

// null key means to replace terminal transitions
export function repointTransition<T>(machine: NestedMachine<T>, oldNode: string, newNode: string): NestedMachine<T> {
    const newMachine = { start: machine.start, states: { ...machine.states }};

    if(newMachine.start === oldNode) {
        newMachine.start = newNode;
    }

    for(const [ key, value ] of Object.entries(machine.states)) {
        const newState = { ...value };
        if('defaultTransition' in newState && newState.defaultTransition) {
            if(oldNode !== null) {
                if(newState.defaultTransition === oldNode) {
                    newState.defaultTransition = newNode;
                }
                if(newState.transitions) {
                    newState.transitions = newState.transitions.map(transition => {
                        if(transition.state === oldNode) {
                            return { ...transition, state: newNode };
                        } 
                        return transition;
                        
                    });
                }
            }
        } else {
            if(oldNode === null) {
                // @ts-expect-error
                newState.defaultTransition = newNode;
            }
        }
        newMachine.states[key] = newState;
    }

    return newMachine;
}

function adjacencyMatrix(machine: NestedMachine<any>): {[key: string]: Set<string>} {
    return Object.fromEntries(
        Object.entries(machine.states).map(([ key, state ]) => [ key, 
            'defaultTransition' in state && state.defaultTransition ? new Set([ state.defaultTransition, ...(state.transitions?.map(transition => transition.state) ?? []) ]) : new Set(),
        ]),
    );
}

export function printMachine<T>(machine: NestedMachine<T>) {
    return [ machine.start, adjacencyMatrix(machine) ];
}

function reverseAdjacencyMatrix(machine: NestedMachine<any>): {[key: string]: Set<string>} {
    const matrix = Object.fromEntries(Object.keys(machine.states).map(key => [ key, new Set<string>() ]));

    for(const [ key, state ] of Object.entries(machine.states)) {
        if('defaultTransition' in state && state.defaultTransition) {
            matrix[state.defaultTransition].add(key);
            if(state.transitions) {
                for(const transition of state.transitions) {
                    matrix[transition.state].add(key);
                }
            }
        }
    }

    return matrix;
}

/**
 * Attempt to simplify a machine by removing un-necessary nodes
 * @param machine 
 * @param transitions 
 */
function simplify<T>(machine: Machine<T>): Machine<T> {
    // TODO how do we keep the semantic meaning of nodes

    const adjacencyMatrix = reverseAdjacencyMatrix(machine);
    
    const newMachine: Machine<T> = { ...machine };

    for(const [ name, state ] of Object.entries(machine.states)) {
        if(!(name in newMachine.states)) {
            // TODO better in-place updating?
            continue;
        } 
        // TODO merge adjacent nodes run together if they are 1:1
        if(state.run === undefined) {
            // TODO we can have multiple outgoing if the next node also has no logic
            const singleOutgoing = 'defaultTransition' in state && state.defaultTransition && state.transitions === undefined;
            if(singleOutgoing) {
                const next = state.defaultTransition;
                const singleIncoming = adjacencyMatrix[next].size === 1 && adjacencyMatrix[next].has(name);
                if(singleIncoming) {
                    const merged = { ...newMachine.states[next] };
                    
                    delete newMachine.states[next];

                    newMachine.states[name] = merged;
                }
            }
        }
    }

    return newMachine;
}

/**
 * Adds a transition onto all terminal states
 */
export function flatten<T>(machine: NestedMachine<T>): Machine<T> {
    let newMachine: NestedMachine<T> = { start: machine.start, states: { ...machine.states }};

    for(const name in machine.states) {
        const state = newMachine.states[name];
        if(state.run !== undefined && 'states' in state.run) {
            newMachine.states[name].run = flatten(state.run);
        }
    }

    const nameCounts: Record<string, number> = {};
    for(const name in machine.states) {
        const nested = machine.states[name];
        if(nested.run && 'states' in nested.run) {
            for(const nestedName of Object.keys(nested.run.states)) {
                nameCounts[nestedName] ??= 0;
                nameCounts[nestedName]++;
            }
        } else {
            nameCounts[name] ??= 0;
            nameCounts[name]++;
        }
    }

    const globallyUnique = !Object.values(nameCounts).some(value => value > 1); // TODO can this be moved down into the state-wise handling?

    for(const name in machine.states) {
        const state = newMachine.states[name];
        if(state.run !== undefined && 'states' in state.run) {
            delete newMachine.states[name];

            const prefix = globallyUnique ? '' : `${name}_`;

            // does the current 'flatten inner' first work well for this?
            const buildName = (oldName: string) => prefix + oldName;

            let nested = { ...state.run } as Machine<T>;
            if(!globallyUnique) {
                // no need to rename nodes if they would all be globally unique
                for(const nestedState in state.run.states) {
                    nested = renameNode(nested, nestedState, buildName(nestedState)) as Machine<T>;
                }
            }

            // TODO self-pointing nodes

            // wire other nodes in `machine` pointing to `name` to point to the start
            newMachine = repointTransition(newMachine, name, nested.start) as Machine<T>;
        
            // wire all terminal nodes in `nested` to use the `transitions` of `state` or do not provide transitions (end of machine)
            if('defaultTransition' in state && state.defaultTransition) {
                for(const [ key, nestedState ] of Object.entries(nested.states)) {
                    // @ts-ignore
                    if(!('defaultTransition' in nestedState) || nestedState.defaultTransition === undefined) {
                        nested.states[key] = { ...state, run: nestedState.run };
                    }
                }
            }

            newMachine.states = { ...newMachine.states, ...nested.states };
        } else {
            // do nothing - if the node is empty then we will let `simplify` handle
        }
    }

    return newMachine as Machine<T>;
}

export function adapt<T extends StatefulControllers>(machine: NestedMachine<T>): GenericGameStateTransitions<typeof STANDARD_STATES, T> {
    const flattened = flatten(machine); // TODO simplify

    // console.log(printMachine(flattened));

    if(flattened.start !== 'START_GAME' && !('START_GAME' in flattened.states || 'END_GAME' in flattened.states)) {
        throw new Error('Invalid machine - expected states START_GAME and END_GAME');
    }

    return Object.fromEntries(
        Object.entries(flattened.states)
            .map(([ key, state ]) => {
                return [ key, (controllers: T) => {
                    if(state.run) {
                        state.run(controllers);
                    }
                    if('defaultTransition' in state && state.defaultTransition) {
                        let newState = state.defaultTransition;

                        for(const transition of (state.transitions ?? [])) {
                            if(transition.condition(controllers)) {
                                newState = transition.state;
                                break;
                            }
                        }

                        // console.log(key, '->', newState);

                        controllers.state.set(newState);
                    }
                } ];
            }),
    ) as GenericGameStateTransitions<typeof STANDARD_STATES, T>;
}

// TODO validate

export type StatefulControllers = IndexedControllers & { state: GameStateController<any>; waiting: WaitingController; completed: CompletedController; };
