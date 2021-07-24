import { Message } from "../messages/message";
import { Handler, HandlerAction } from "./handler";

export type WaitingHandlerParams = {
   waitingFor: [string[] | undefined]
}

/**
 * Interface to listen for waiting events
 */
export abstract class WaitingHandler<HandlerData, ResponseMessage extends Message> implements Handler<WaitingHandlerParams, HandlerData, ResponseMessage> {
   /**
    * Updates a handler on who the game is currently waiting on
    */
   abstract handleWaitingFor: HandlerAction<HandlerData, ResponseMessage, [string[] | undefined]>;
}