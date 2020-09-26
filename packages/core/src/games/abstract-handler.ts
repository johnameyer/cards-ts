import { Observer } from "./observer";
import { AbstractHandlerData } from "./abstract-handler-data";
import { Message } from "./message";
import { AbstractGameState } from "./abstract-game-state";

/**
 * Abstract class that defines a handler - an actor in the game who modifies the state through actions
 * This class doesn't define the actions, but enforces a minimum set of items
 */
export abstract class AbstractHandler<HandlerData extends AbstractHandlerData> implements Observer<HandlerData> {
    // TODO [action: string]: (state: HandlerData) => any ?
    // TODO can be interface?

    abstract message(message: Message, gameState: HandlerData): void | Promise<void>;

    abstract waitingFor(who: string[] | undefined, gameState: HandlerData): void | Promise<void>;

    /**
     * The name the user is known by
     * @param taken the names that are already taken by other users
     */
    abstract getName(taken: string[]): string;
}