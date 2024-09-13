import { GameHandler, HandlerData } from '../game-handler.js';
import { ResponseMessage } from '../messages/response-message.js';
import { FlipResponseMessage } from '../messages/response/index.js';
import { Intermediary } from '@cards-ts/core';
import { HandlerResponsesQueue } from '@cards-ts/core';

const toInquirerValue = <T extends { toString: () => string }>(t: T) => ({
    name: t.toString(),
    value: t,
});

export class IntermediaryHandler extends GameHandler {
    constructor(private intermediary: Intermediary) {
        super();
    }

    async handleFlip(_handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): Promise<void> {
        let responded = false;
        while (!responded) {
            const [sent, received] = this.intermediary.form({ type: 'confirm', message: ['Flip?'] });
            if ((await received)[0]) {
                responsesQueue.push(new FlipResponseMessage());
                responded = true;
            }
        }
    }
}
