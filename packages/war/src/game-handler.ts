import { Controllers } from './controllers/controllers.js';
import { GameHandlerParams } from './game-handler-params.js';
import { ResponseMessage } from './messages/response-message.js';
import { ControllerHandlerState, Handler, HandlerResponsesQueue } from '@cards-ts/core';

export type HandlerData = ControllerHandlerState<Controllers>;

export abstract class GameHandler implements Handler<GameHandlerParams, HandlerData, ResponseMessage> {
    abstract handleFlip(handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void | Promise<void>;
}
