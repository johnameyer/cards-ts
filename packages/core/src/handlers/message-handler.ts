import { Serializable } from '../intermediary/serializable.js';
import { Message } from '../messages/message.js';
import { Handler, HandlerAction } from './handler.js';

export type MessageHandlerParams = {
   message: [Message]
}

/**
 * Interface to listen for message events
 * @category Handler
 */
export abstract class MessageHandler<HandlerData extends Serializable, ResponseMessage extends Message> implements Handler<MessageHandlerParams, HandlerData, ResponseMessage> {
   /**
    * Sends a message to the handler
    */
   abstract handleMessage: HandlerAction<HandlerData, ResponseMessage, [Message]>;
}
