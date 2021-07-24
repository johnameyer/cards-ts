import { Handler, HandlerAction } from "@cards-ts/core";
import { HandlerData } from "./handler-data";
import { DataResponseMessage, DealerDiscardResponseMessage, GoingAloneResponseMessage, OrderUpResponseMessage, NameTrumpResponseMessage, TurnResponseMessage } from "./messages/response";
import { ResponseMessage } from "./messages/response-message";

export type GameHandlerParams = {
    orderUp: [],
    nameTrump: [],
    dealerDiscard: [],
    turn: []
}

export abstract class GameHandler implements Handler<GameHandlerParams, HandlerData, ResponseMessage> {
    abstract handleOrderUp: HandlerAction<HandlerData, DataResponseMessage | OrderUpResponseMessage | GoingAloneResponseMessage>;

    abstract handleNameTrump: HandlerAction<HandlerData, DataResponseMessage | NameTrumpResponseMessage | GoingAloneResponseMessage>;

    abstract handleDealerDiscard: HandlerAction<HandlerData, DataResponseMessage | DealerDiscardResponseMessage>;

    abstract handleTurn: HandlerAction<HandlerData, DataResponseMessage | TurnResponseMessage>;
}