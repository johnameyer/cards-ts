import { Controllers } from './controllers/controllers.js';
import { ResponseMessage } from './messages/response-message.js';
import { EventHandler, buildEventHandler } from '@cards-ts/core';

export const eventHandler = buildEventHandler<Controllers, ResponseMessage>({
    'flip-response': {
        merge: EventHandler.removeWaiting('waiting'),
    },
});
