import { Message } from "../games/message";
import { Handler, HandlerAction } from "./handler";

export type WaitingHandlerParams = {
   waitingFor: [string[] | undefined]
}

/**
 * Interface to listen for waiting events
 */
export abstract class WaitingHandler<HandlerData, ResponseMessage extends Message> implements Handler<WaitingHandlerParams, HandlerData, ResponseMessage> {
   canHandle(key: any): key is 'waitingFor' {
      return key === 'waitingFor';
   }
   
   /**
    * Updates a handler on who the game is currently waiting on
    */
   abstract waitingFor: HandlerAction<HandlerData, ResponseMessage, [string[] | undefined]>;
}