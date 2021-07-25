import { Handler, HandlerAction } from "@cards-ts/core";
import { HandlerData } from "./handler-data";
import { DataResponseMessage, PassResponseMessage, TurnResponseMessage } from "./messages/response";
import { ResponseMessage } from "./messages/response-message";

export type GameHandlerParams = {
    pass: [],
    turn: []
}

export abstract class GameHandler implements Handler<GameHandlerParams, HandlerData, ResponseMessage> {
    abstract handlePass: HandlerAction<HandlerData, DataResponseMessage | PassResponseMessage>;

    abstract handleTurn: HandlerAction<HandlerData, DataResponseMessage | TurnResponseMessage>;
}