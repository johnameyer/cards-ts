import { AbstractHandler, Card } from "@cards-ts/core";
import { HandlerData } from "./handler-data";

export abstract class Handler extends AbstractHandler<HandlerData> {
    /*
        Here you list out the possible actions that a player will take.
        Usually you will want to return the custom handler-specific data
            alongside the result you expect so it can be preserved.
     */
    abstract async action(handlerData: HandlerData): Promise<[unknown, unknown?]>;
}