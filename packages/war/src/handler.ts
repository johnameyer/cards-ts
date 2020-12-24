import { GenericHandler, HandlerResponsesQueue } from "@cards-ts/core";
import { HandlerData } from "./handler-data";
import { ResponseMessage } from "./messages/response-message";

export interface Handler extends GenericHandler<HandlerData, ResponseMessage> {
    flip(handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void | Promise<void>;
}