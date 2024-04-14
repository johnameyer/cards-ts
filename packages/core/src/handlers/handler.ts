import { Message } from '../messages/message.js';
import { HandlerResponsesQueue } from '../games/response-queue.js';
import { Serializable } from '../intermediary/serializable.js';

export type WithData<T> = {
    data?: { [key: string]: Serializable },
    payload: T,
}

export type HandlerAction<HandlerData, ResponseMessage, Vargs extends any[] = any[]> = (this: any, gameState: HandlerData, response: HandlerResponsesQueue<WithData<ResponseMessage>>, ...args: Vargs) => void | Promise<void>;

type HandleKeys<Handlers extends {[key: string]: any[]}, Handler extends keyof Handlers> = Handler extends string ? `handle${Capitalize<Handler>}` : never;

/**
 * An element that can listen to events and push response messages
 */
export type Handler<Handlers extends {[key: string]: any[]}, HandlerData extends Serializable, ResponseMessage extends Message> = {
    [Handler in keyof Handlers as HandleKeys<Handlers, Handler>]: HandlerAction<HandlerData, ResponseMessage, Handlers[Handler]>;
};

/**
 * A chain of handlers, where the first that can handle an event will handle it
 */
export class HandlerChain<Handlers extends {[key: string]: any[]}, HandlerData extends Serializable, ResponseMessage extends Message> {
    /**
     * Create a new chain
     * @param handlers the handlers to include in the chain
     */
    constructor(private readonly handlers: Handler<Handlers, HandlerData, ResponseMessage>[] = []) { }

    /**
     * Adds a handler to this chain
     * @param handler the handler to add
     */
    append<AddedHandlers extends {[key: string]: any[]}, AddedResponseMessages extends Message>(
        handler: Handler<AddedHandlers, HandlerData, AddedResponseMessages>,
    ): HandlerChain<Handlers & AddedHandlers, HandlerData, ResponseMessage | AddedResponseMessages> {
        const handlers = [ ...this.handlers, handler ] as any as Handler<Handlers & AddedHandlers, HandlerData, ResponseMessage | AddedResponseMessages>[];
        return new HandlerChain(handlers);
    }
    
    /**
     * Finds and calls the handler that can handle this event
     * @param method the event type
     * @param args the args to pass to the handler
     */
    call<Method extends keyof Handlers>(method: Method, ...args: Parameters<HandlerAction<HandlerData, ResponseMessage, Handlers[Method]>>): ReturnType<HandlerAction<HandlerData, ResponseMessage, Handlers[Method]>> {
        for(const handler of this.handlers) {
            if((handler as any)['handle' + capitalize(method.toString())]) {
                return ((handler as any)['handle' + capitalize(method.toString())] as HandlerAction<HandlerData, ResponseMessage, Handlers[Method]>).call(handler, ...args);
            }
        }
    }
}

const capitalize = ([ first, ...rest ]: string) => first.toLocaleUpperCase() + rest.join('');
