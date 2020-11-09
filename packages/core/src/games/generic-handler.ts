import { Message } from './message';
import { HandlerResponsesQueue } from './response-queue';

/**
 * Abstract class that defines a handler - an actor in the game who modifies the state through actions
 * This class doesn't define the actions, but enforces a minimum set of items
 */
export interface GenericHandler<HandlerData, ResponseMessage extends Message> {
    /**
     * Sends a message to the handler
     * @param gameState the current game state
     * @param response allows for some action to be taken in response to a given message
     * @param message the message
     */
    message(gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, message: Message): void | Promise<void>;

    /**
     * Updates a handler on who the game is currently waiting on
     * @param gameState the current game state
     * @param response allows for some action to be taken in response
     * @param who who the game is waiting on
     */
    waitingFor(gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, who: string[] | undefined): void | Promise<void>;
}

export type HandlerAction<HandlerData, ResponseMessage> = (gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, ...args: any[]) => void | Promise<void>;