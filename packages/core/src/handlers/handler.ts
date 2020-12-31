import { Message } from "../games/message";
import { HandlerResponsesQueue } from "../games/response-queue";

export type HandlerAction<HandlerData, ResponseMessage, Vargs extends any[] = any[]> = (this: any, gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, ...args: Vargs) => void | Promise<void>;

/**
 * An actor in the game who modifies the state through actions
 * Listeners can be subscribed here
 */
export type Handler<Handlers extends keyof any, HandlerData, ResponseMessage extends Message> = {
    canHandle(key: any): key is Handlers;
} & {
    [Handler in Handlers]: HandlerAction<HandlerData, ResponseMessage>;
};

export class HandlerChain<Methods extends string, HandlerData, ResponseMessage extends Message> {
    private handlers: Handler<any, HandlerData, ResponseMessage>[] = [];

    constructor() { }

    append(handler: Handler<any, HandlerData, ResponseMessage>) {
        this.handlers.push(handler);
        return this;
    }
    
    call(event: Methods, ...args: Parameters<HandlerAction<HandlerData,ResponseMessage>>): ReturnType<HandlerAction<HandlerData, ResponseMessage>> {
        for(const handler of this.handlers) {
            if(handler.canHandle(event)) {
                return handler[event].call(this, ...args);
            }
        }
    }
}