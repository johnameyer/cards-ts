import { AbstractHandler } from "../games/abstract-handler";
import { HandlerData } from "./handler-data";
import { Card } from "../cards/card";

export abstract class Handler extends AbstractHandler<HandlerData> {
    abstract async pass(handlerData: HandlerData): Promise<[Card[], unknown?]>;

    abstract async turn(handlerData: HandlerData): Promise<[Card, unknown?]>;
}