import { STANDARD_STATES } from '../games/game-states.js';
import { AbstractController, GenericControllerProvider } from './controller.js';

type GameState<Enum extends typeof STANDARD_STATES> = Exclude<keyof Enum, number | symbol>;

/**
 * @category Controller Provider
 */
export class GameStateControllerProvider<Enum extends typeof STANDARD_STATES> implements GenericControllerProvider<GameState<Enum>, {}, GameStateController<Enum>> {
    private readonly initial: keyof Enum = STANDARD_STATES.START_GAME;

    controller(state: GameState<Enum>, controllers: {}): GameStateController<Enum> {
        return new GameStateController(state, controllers);
    }

    initialState(): GameState<Enum> {
        return this.initial as GameState<Enum>;
    }

    dependencies() {
        return {};
    }
}

/**
 * Keeps track of the state of the game
 * @category Controller
 */
export class GameStateController<Enum extends typeof STANDARD_STATES> extends AbstractController<GameState<Enum>, {}, undefined> {
    get() {
        return this.state;
    }

    set(newState: GameState<Enum>) {
        this.state = newState;
    }

    override getFor(): undefined {
        return undefined;
    }
}
