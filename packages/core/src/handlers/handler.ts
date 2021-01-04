import { Message } from "../games/message";
import { HandlerResponsesQueue } from "../games/response-queue";

export type HandlerAction<HandlerData, ResponseMessage, Vargs extends any[] = any[]> = (this: any, gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, ...args: Vargs) => void | Promise<void>;

/**
 * An element that can listen to events and push response messages
 */
export type Handler<Handlers extends {[key: string]: any[]}, HandlerData, ResponseMessage extends Message> = {
    canHandle(key: any): key is keyof Handlers;
} & {
    [Handler in keyof Handlers]: HandlerAction<HandlerData, ResponseMessage, Handlers[Handler]>;
};

/**
 * A chain of handlers, where the first that can handle an event will handle it
 */
export class HandlerChain<Handlers extends {[key: string]: any[]}, HandlerData, ResponseMessage extends Message> {
    /**
     * Create a new chain
     * @param handlers the handlers to include in the chain
     */
    constructor(private readonly handlers: Handler<Handlers, HandlerData, ResponseMessage>[] = []) { }

    /**
     * Adds a handler to this chain
     * @param handler the handler to add
     */
    append<Handles extends keyof Handlers>(handler: Handler<Pick<Handlers, Handles>, HandlerData, ResponseMessage>) {
        this.handlers.push(handler as Handler<Handlers, HandlerData, ResponseMessage>);
        return this;
    }
    
    /**
     * Finds and calls the handler that can handle this event
     * @param method the event type
     * @param args the args to pass to the handler
     */
    call<Method extends keyof Handlers>(method: Method, ...args: Parameters<HandlerAction<HandlerData, ResponseMessage, Handlers[Method]>>): ReturnType<HandlerAction<HandlerData, ResponseMessage, Handlers[Method]>> {
        for(const handler of this.handlers) {
            if(handler.canHandle(method)) {
                return (handler[method] as HandlerAction<HandlerData, ResponseMessage, Handlers[Method]>).call(handler, ...args);
            }
        }
    }
}