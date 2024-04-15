import { GenericGameState, STANDARD_STATES, GameStateControllerProvider, WaitingControllerProvider, WaitingController, GenericHandlerController, Handler } from '../../src/index.js';
import { GenericHandlerControllerProvider } from '../../src/games/generic-handler-controller.js';
import { NestedMachine, Machine, StatefulControllers } from '../../src/state-machine/index.js';
import { mockControllerProviders, MockController } from '../controllers/mock-controller.js';
import { MockHandlerParams } from '../handlers/mock-handler.js';
import { mockHandlerProxy } from '../games/mock-handler-proxy.js';

/**
 * Progress the state machine forward one transition
 * @returns if can continue at this time
 */
export function advance<T extends StatefulControllers>(gameState: GenericGameState<T>, machine: NestedMachine<T>) {
    // TODO prevent advancing after completed

    if(gameState.controllers.waiting.isWaitingOnPlayer()) { // TODO clean this up
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
    mock: MockController,
}

export type MockControllersWithPlayers = {
    mock: MockController,
    waiting: WaitingController,
    players: GenericHandlerController<any, MockHandlerParams>,
}

export function buildGameStateWithPlayers(handlers: Handler<MockHandlerParams, any, any>[]) {
    const handlerProxy = mockHandlerProxy(handlers);

    const mockControllerProvidersWithPlayers = {
        waiting: new WaitingControllerProvider(),
        players: new GenericHandlerControllerProvider<any, MockHandlerParams>(handlerProxy),
        state: new GameStateControllerProvider(),
    };

    return new GenericGameState({ ...mockControllerProviders, ...mockControllerProvidersWithPlayers });
}
