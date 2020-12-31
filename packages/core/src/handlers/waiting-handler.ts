import { Message } from "../games/message";
import { Handler, HandlerAction } from "./handler";

/**
 * Interface to listen for waiting events
 */
export abstract class WaitingHandler<HandlerData, ResponseMessage extends Message> implements Handler<'waitingFor', HandlerData, ResponseMessage> {
   canHandle(key: any): key is 'waitingFor' {
      return key === 'waitingFor';
   }
   
   /**
    * Updates a handler on who the game is currently waiting on
    */
   abstract waitingFor: HandlerAction<HandlerData, ResponseMessage, [string[] | undefined]>;
}