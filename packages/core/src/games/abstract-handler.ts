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

    abstract message(gameState: HandlerData, message: Message): [sent?: Promise<void>, responded?: any | Promise<any>];

    abstract waitingFor(gameState: HandlerData, who: string[] | undefined): [sent?: Promise<void>];

    [action: string]: (gameState: HandlerData, ...args: any[]) => [sent?: Promise<void>, responded?: any | Promise<any>];
}