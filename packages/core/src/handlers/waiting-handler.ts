import { Serializable } from '../intermediary/serializable.js';
import { Message } from '../messages/message.js';
import { Handler, HandlerAction } from './handler.js';

export type WaitingHandlerParams = {
   waitingFor: [number[] | number | undefined]
}

/**
 * Interface to listen for waiting events
 * @category Handler
 */
export abstract class WaitingHandler<HandlerData extends Serializable, ResponseMessage extends Message> implements Handler<WaitingHandlerParams, HandlerData, ResponseMessage> {
    /**
     * Updates a handler on who the game is currently waiting on
     */
    abstract handleWaitingFor: HandlerAction<HandlerData, ResponseMessage, [number[] | number | undefined]>;
}
