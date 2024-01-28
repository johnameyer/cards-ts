import { Controllers } from './controllers/controllers.js';
import { GameHandlerParams } from './game-handler-params.js';
import { DealerDiscardResponseMessage, GoingAloneResponseMessage, OrderUpResponseMessage, NameTrumpResponseMessage } from './messages/response/index.js';
import { ResponseMessage } from './messages/response-message.js';
import { ControllerHandlerState, DataResponseMessage, Handler, HandlerAction, PlayCardResponseMessage } from '@cards-ts/core';

export type HandlerData = ControllerHandlerState<Controllers>;

export abstract class GameHandler implements Handler<GameHandlerParams, HandlerData, ResponseMessage> {
    abstract handleOrderUp: HandlerAction<HandlerData, DataResponseMessage | OrderUpResponseMessage | GoingAloneResponseMessage>;

    abstract handleNameTrump: HandlerAction<HandlerData, DataResponseMessage | NameTrumpResponseMessage | GoingAloneResponseMessage>;

    abstract handleDealerDiscard: HandlerAction<HandlerData, DataResponseMessage | DealerDiscardResponseMessage>;

    abstract handleTurn: HandlerAction<HandlerData, DataResponseMessage | PlayCardResponseMessage>;
}
