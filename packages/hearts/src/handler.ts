import { AbstractHandler, Card } from "@cards-ts/core";
import { HandlerData } from "./handler-data";

export abstract class Handler extends AbstractHandler<HandlerData> {
    abstract async pass(handlerData: HandlerData): Promise<[Card[], unknown?]>;

    abstract async turn(handlerData: HandlerData): Promise<[Card, unknown?]>;
}