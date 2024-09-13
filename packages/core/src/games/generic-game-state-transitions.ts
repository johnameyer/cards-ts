import { GameStateController, IndexedControllers, WaitingController } from '../controllers/index.js';
import { STANDARD_STATES } from './game-states.js';

/**
 * A single transforming function, ran when a certain state is entered
 * @typeParam State the state enum for this game
 * @typeParam Controllers the state controllers for this game
 */
type Transition<State extends typeof STANDARD_STATES, Controllers extends IndexedControllers & { waiting: WaitingController; state: GameStateController<State> }> = (
    this: void,
    controllers: Controllers,
) => void;

/**
 * Interface for describing the changes in the state of the game and the effect on the game state
 */
export type GenericGameStateTransitions<
    State extends typeof STANDARD_STATES,
    Controllers extends IndexedControllers & { waiting: WaitingController; state: GameStateController<State> },
> = {
    /**
     * Functions that transform the state, arranged by the state enum
     */
    [state in keyof State]: Transition<State, Controllers>;
};
