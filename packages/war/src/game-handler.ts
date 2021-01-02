import { Handler, HandlerResponsesQueue } from "@cards-ts/core";
import { HandlerData } from "./handler-data";
import { ResponseMessage } from "./messages/response-message";

export type GameHandlerParams = {
    flip: []
}

export abstract class GameHandler implements Handler<GameHandlerParams, HandlerData, ResponseMessage> {
    canHandle(key: any): key is 'flip' {
        return key === 'flip';
    }
    
    abstract flip(handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void | Promise<void>;
}