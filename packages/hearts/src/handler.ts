import { AbstractHandler, Card, HandlerResponsesQueue } from "@cards-ts/core";
import { HandlerData } from "./handler-data";
import { PassResponseMessage, TurnResponseMessage } from "./messages/response";
import { ResponseMessage } from "./messages/response-message";

export abstract class Handler extends AbstractHandler<HandlerData, ResponseMessage> {
    abstract pass(handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void | Promise<void>;

    abstract turn(handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void | Promise<void>;
}