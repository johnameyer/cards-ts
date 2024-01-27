import { GameStateController, IndexedControllers, WaitingController } from '../controllers/index.js';
import { STANDARD_STATES } from './game-states.js';

/**
 * A single transforming function, ran when a certain state is entered
 * @typeParam State the state enum for this game
 * @typeParam Controllers the state controllers for this game
 */
type Transition<State extends typeof STANDARD_STATES, Controllers extends IndexedControllers & { waiting: WaitingController, state: GameStateController<State> }> = (controllers: Controllers) => void;

/**
 * Interface for describing the changes in the state of the game and the effect on the game state
 */
export interface GenericGameStateTransitions<State extends typeof STANDARD_STATES, Controllers extends IndexedControllers & { waiting: WaitingController, state: GameStateController<State> }> {
    /**
     * Get the functions that transform the state, arranged by the state enum (these will be bound to this class)
     */
    get(): { [state in keyof State]: Transition<State, Controllers> };
}
