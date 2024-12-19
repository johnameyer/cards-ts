import { Controllers } from './controllers/controllers.js';
import { GameHandlerParams } from './game-handler-params.js';
import { PassResponseMessage } from './messages/response/index.js';
import { ResponseMessage } from './messages/response-message.js';
import { ControllerHandlerState, Handler, HandlerAction, PlayCardResponseMessage } from '@cards-ts/core';

export type HandlerData = ControllerHandlerState<Controllers>;

export abstract class GameHandler implements Handler<GameHandlerParams, HandlerData, ResponseMessage> {
    abstract handlePass: HandlerAction<HandlerData, PassResponseMessage>;

    abstract handleTurn: HandlerAction<HandlerData, PlayCardResponseMessage>;
}
