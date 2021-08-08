import { Serializable } from "../intermediary/serializable";
import { Message } from "../messages/message";
import { Handler, HandlerAction } from "./handler";
import { MessageHandlerParams } from "./message-handler";
import { WaitingHandlerParams } from "./waiting-handler";

export type SystemHandlerParams = MessageHandlerParams & WaitingHandlerParams;

/**
 * Interface to listen for all system events (e.g. message and waiting)
 */
export abstract class SystemHandler<HandlerData extends Serializable, ResponseMessage extends Message> implements Handler<SystemHandlerParams, HandlerData, ResponseMessage> {
   /**
    * Sends a message to the handler
    */
   abstract handleMessage: HandlerAction<HandlerData, ResponseMessage, [Message]>;
   
   /**
    * Updates a handler on who the game is currently waiting on
    */
   abstract handleWaitingFor: HandlerAction<HandlerData, ResponseMessage, [number[] | number | undefined]>;
}