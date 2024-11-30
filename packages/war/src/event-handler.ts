import { Controllers } from './controllers/controllers.js';
import { ResponseMessage } from './messages/response/index.js';
import { EventHandler, buildEventHandler } from '@cards-ts/core';

export const eventHandler = buildEventHandler<Controllers, ResponseMessage>({
    flipResponse: {
        merge: EventHandler.removeWaiting('waiting'),
    },
});
