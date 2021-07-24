import { HandlerResponsesQueue, Message } from "@cards-ts/core";
import { GameHandler } from "../game-handler";
import { HandlerData } from "../handler-data";
import { FlipResponseMessage } from "../messages/response";
import { ResponseMessage } from "../messages/response-message";

export class DefaultBotHandler extends GameHandler {
    handleFlip(handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void | Promise<void> {
        responsesQueue.push(new FlipResponseMessage());
    }
}