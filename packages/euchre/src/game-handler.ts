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
    canHandle(key: any): key is ('orderUp' | 'nameTrump' | 'dealerDiscard' | 'turn') {
       return key === 'orderUp' || key === 'nameTrump' || key === 'dealerDiscard' || key === 'turn';
    }

    abstract orderUp: HandlerAction<HandlerData, DataResponseMessage | OrderUpResponseMessage | GoingAloneResponseMessage>;

    abstract nameTrump: HandlerAction<HandlerData, DataResponseMessage | NameTrumpResponseMessage | GoingAloneResponseMessage>;

    abstract dealerDiscard: HandlerAction<HandlerData, DataResponseMessage | DealerDiscardResponseMessage>;

    abstract turn: HandlerAction<HandlerData, DataResponseMessage | TurnResponseMessage>;
}