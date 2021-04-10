import { Message } from "../messages/message";
import { Handler, HandlerAction } from "./handler";
import { MessageHandlerParams } from "./message-handler";
import { WaitingHandlerParams } from "./waiting-handler";

export type SystemHandlerParams = MessageHandlerParams & WaitingHandlerParams;

/**
 * Interface to listen for all system events (e.g. message and waiting)
 */
export abstract class SystemHandler<HandlerData, ResponseMessage extends Message> implements Handler<SystemHandlerParams, HandlerData, ResponseMessage> {
   canHandle(key: any): key is ('message' | 'waitingFor') {
      return key === 'message' || key == 'waitingFor';
   }
   
   /**
    * Sends a message to the handler
    */
   abstract message: HandlerAction<HandlerData, ResponseMessage, [Message]>;
   
   /**
    * Updates a handler on who the game is currently waiting on
    */
   abstract waitingFor: HandlerAction<HandlerData, ResponseMessage, [string[] | undefined]>;
}