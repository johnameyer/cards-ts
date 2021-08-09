import { ControllerHandlerState, DataResponseMessage, Handler, HandlerAction, PlayCardResponseMessage } from '@cards-ts/core';
import { Controllers } from './controllers/controllers';
import { GameHandlerParams } from './game-handler-params';
import { PassResponseMessage } from './messages/response';
import { ResponseMessage } from './messages/response-message';

export type HandlerData = ControllerHandlerState<Controllers>;

export abstract class GameHandler implements Handler<GameHandlerParams, HandlerData, ResponseMessage> {
    abstract handlePass: HandlerAction<HandlerData, DataResponseMessage | PassResponseMessage>;

    abstract handleTurn: HandlerAction<HandlerData, DataResponseMessage | PlayCardResponseMessage>;
}
