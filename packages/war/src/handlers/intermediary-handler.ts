import { GameHandler } from '../game-handler';
import { HandlerData } from '../handler-data';
import { Card, HandlerResponsesQueue } from '@cards-ts/core';
import { Message } from '@cards-ts/core';
import { Intermediary } from '@cards-ts/core';
import { ResponseMessage } from '../messages/response-message';
import { FlipResponseMessage } from '../messages/response';

const toInquirerValue = <T extends {toString: () => string}>(t: T) => ({
    name: t.toString(),
    value: t,
});

export class IntermediaryHandler extends GameHandler {
    constructor(private intermediary: Intermediary) {
        super();
    }

    async flip(_handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): Promise<void> {
        while (true){
            let [sent, received] = this.intermediary.form({type: 'confirm', message: ['Flip?']});
            if((await received)[0]) {
                responsesQueue.push(new FlipResponseMessage());
                break;
            }
        }
    }
}