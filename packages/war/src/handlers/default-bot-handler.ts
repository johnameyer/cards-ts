import { HandlerResponsesQueue, Message } from "@cards-ts/core";
import { Handler } from "../handler";
import { HandlerData } from "../handler-data";
import { FlipResponseMessage } from "../messages/response";
import { ResponseMessage } from "../messages/response-message";

export class DefaultBotHandler implements Handler {
    flip(handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void | Promise<void> {
        responsesQueue.push(new FlipResponseMessage());
    }

    message(gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, message: Message): void | Promise<void> {
    }

    waitingFor(gameState: HandlerData, response: HandlerResponsesQueue<ResponseMessage>, who: string[] | undefined): void | Promise<void> {
    }
}