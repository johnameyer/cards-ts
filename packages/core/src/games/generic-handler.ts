import { Message } from "./message";
import { HandlerResponsesQueue } from "./response-queue";

/**
 * Abstract class that defines a handler - an actor in the game who modifies the state through actions
 * This class doesn't define the actions, but enforces a minimum set of items
 */
export interface GenericHandler<HandlerData, ResponseMessage extends Message> {
    message(gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, message: Message): void | Promise<void>;

    waitingFor(gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, who: string[] | undefined): void | Promise<void>;
}

export type HandlerAction<HandlerData, ResponseMessage> = (gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, ...args: any[]) => void | Promise<void>;