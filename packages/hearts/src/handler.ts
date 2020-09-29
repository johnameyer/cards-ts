import { AbstractHandler, Card } from "@cards-ts/core";
import { HandlerData } from "./handler-data";
import { PassResponseMessage, TurnResponseMessage } from "./messages/response";

export abstract class Handler extends AbstractHandler<HandlerData> {
    abstract pass(handlerData: HandlerData): [sent: undefined | Promise<void>, received: PassResponseMessage | Promise<PassResponseMessage>];

    abstract turn(handlerData: HandlerData): [sent: undefined | Promise<void>, received: TurnResponseMessage | Promise<TurnResponseMessage>];
}