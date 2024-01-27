import { GameHandler, HandlerData } from '../game-handler.js';
import { FlipResponseMessage } from '../messages/response/index.js';
import { ResponseMessage } from '../messages/response-message.js';
import { HandlerResponsesQueue } from '@cards-ts/core';

export class DefaultBotHandler extends GameHandler {
    handleFlip(handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void | Promise<void> {
        responsesQueue.push(new FlipResponseMessage());
    }
}
