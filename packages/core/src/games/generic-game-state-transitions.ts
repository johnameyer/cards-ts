import { GameStateController, IndexedControllers, WaitingController } from '../controllers';
import { STANDARD_STATES } from './game-states';

type Transition<State extends typeof STANDARD_STATES, Controllers extends IndexedControllers & { waiting: WaitingController, state: GameStateController<State> }> = (controllers: Controllers) => void;

/**
 * Interface for describing the changes in the state of the game and the effect on the game state
 */
export interface GenericGameStateTransitions<State extends typeof STANDARD_STATES, Controllers extends IndexedControllers & { waiting: WaitingController, state: GameStateController<State> }> {
    /**
     * Get the functions that transform the state, arranged by the state enum
     */
    get(): { [state in keyof State]: Transition<State, Controllers> };
}
