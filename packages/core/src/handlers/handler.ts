import { Message } from "../games/message";
import { HandlerResponsesQueue } from "../games/response-queue";

export type HandlerAction<HandlerData, ResponseMessage, Vargs extends any[] = any[]> = (this: any, gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, ...args: Vargs) => void | Promise<void>;

/**
 * An actor in the game who modifies the state through actions
 * Listeners can be subscribed here
 */
export type Handler<Handlers extends {[key: string]: any[]}, HandlerData, ResponseMessage extends Message> = {
    canHandle(key: any): key is keyof Handlers;
} & {
    [Handler in keyof Handlers]: HandlerAction<HandlerData, ResponseMessage, Handlers[Handler]>;
};

export class HandlerChain<Handlers extends {[key: string]: any[]}, HandlerData, ResponseMessage extends Message> {
    constructor(private handlers: Handler<Handlers, HandlerData, ResponseMessage>[] = []) { }

    append<Handles extends keyof Handlers>(handler: Handler<Pick<Handlers, Handles>, HandlerData, ResponseMessage>) {
        this.handlers.push(handler as Handler<Handlers, HandlerData, ResponseMessage>);
        return this;
    }
    
    call<Method extends keyof Handlers>(method: Method, ...args: Parameters<HandlerAction<HandlerData, ResponseMessage, Handlers[Method]>>): ReturnType<HandlerAction<HandlerData, ResponseMessage, Handlers[Method]>> {
        for(const handler of this.handlers) {
            if(handler.canHandle(method)) {
                return (handler[method] as HandlerAction<HandlerData, ResponseMessage, Handlers[Method]>).call(handler, ...args);
            }
        }
    }
}