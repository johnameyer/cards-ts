import { ControllerHandlerState, Handler, HandlerResponsesQueue } from '@cards-ts/core';
import { Controllers } from './controllers/controllers';
import { GameHandlerParams } from './game-handler-params';
import { ResponseMessage } from './messages/response-message';

export type HandlerData = ControllerHandlerState<Controllers>;

export abstract class GameHandler implements Handler<GameHandlerParams, HandlerData, ResponseMessage> {
    abstract handleFlip(handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void | Promise<void>;
}
