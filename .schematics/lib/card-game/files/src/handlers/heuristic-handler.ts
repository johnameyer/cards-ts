import { Handler } from "../handler";
import { HandlerData } from "../handler-data";
import { Message } from '@cards-ts/core';

/*
    This file is for an implementation of a bot.
 */

export class HeuristicHandler extends Handler {

    async play({ hand, gameParams: { numToPass } }: HandlerData): Promise<[unknown, unknown?]> {
        /*
            Here the bot makes its decision for the particular action type.
         */
        return [undefined];
    }

    message(message: Message, data: HandlerData): void {
        /*
            You could use notifications to count cards
         */
    }


}