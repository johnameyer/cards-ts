import { Controllers } from './controllers/controllers.js';
import { ResponseMessage } from './messages/response-message.js';
import { EventHandler, buildEventHandler } from '@cards-ts/core';

export const eventHandler = buildEventHandler<Controllers, ResponseMessage>({
    merge: {
        'flip-response': EventHandler.removeWaiting('waiting'),
    },
    validateEvent: {
        'flip-response': (_controllers, _sourceHandler, event) => event,
    },
});
