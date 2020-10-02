import { Observer } from "./observer";
import { AbstractHandlerData } from "./abstract-handler-data";
import { Message } from "./message";
import { AbstractGameState } from "./abstract-game-state";
import { HandlerResponsesQueue } from "./response-queue";

/**
 * Abstract class that defines a handler - an actor in the game who modifies the state through actions
 * This class doesn't define the actions, but enforces a minimum set of items
 */
export abstract class AbstractHandler<HandlerData extends AbstractHandlerData, ResponseMessage extends Message> {
    // TODO [action: string]: (state: HandlerData) => any ?
    // TODO can be interface?

    abstract message(gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, message: Message): void | Promise<void>;

    abstract waitingFor(gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, who: string[] | undefined): void | Promise<void>;
}

export type HandlerAction<HandlerData, ResponseMessage> = (gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, ...args: any[]) => void | Promise<void>;