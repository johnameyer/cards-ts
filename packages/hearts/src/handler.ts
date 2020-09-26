import { AbstractHandler, Card } from "@cards-ts/core";
import { HandlerData } from "./handler-data";

export abstract class Handler extends AbstractHandler<HandlerData> {
    abstract pass(handlerData: HandlerData): [Card[], unknown?] | Promise<[Card[], unknown?]>;

    abstract turn(handlerData: HandlerData): [Card, unknown?] | Promise<[Card, unknown?]>;
}