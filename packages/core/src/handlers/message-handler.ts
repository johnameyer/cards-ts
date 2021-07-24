import { Message } from "../messages/message";
import { Handler, HandlerAction } from "./handler";

export type MessageHandlerParams = {
   message: [Message]
}

/**
 * Interface to listen for message events
 */
export abstract class MessageHandler<HandlerData, ResponseMessage extends Message> implements Handler<MessageHandlerParams, HandlerData, ResponseMessage> {
   /**
    * Sends a message to the handler
    */
   abstract handleMessage: HandlerAction<HandlerData, ResponseMessage, [Message]>;
}