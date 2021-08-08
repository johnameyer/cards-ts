import { STANDARD_STATES } from "../games/game-states";
import { AbstractController, GenericControllerProvider } from "./controller";

type GameState<Enum extends typeof STANDARD_STATES> = Exclude<keyof Enum, number | symbol>;

export class GameStateControllerProvider<Enum extends typeof STANDARD_STATES> implements GenericControllerProvider<GameState<Enum>, {}, GameStateController<Enum>> {
    constructor(private readonly initial: keyof Enum) { }
    
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