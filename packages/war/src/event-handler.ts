import { Controllers } from './controllers/controllers.js';
import { ResponseMessage } from './messages/response-message.js';
import { wrapEventHandler } from '@cards-ts/core';

export const eventHandler = wrapEventHandler<Controllers, ResponseMessage>({
    merge: {
        'flip-response': (controllers, sourceHandler, _incomingEvent) => controllers.waiting.removePosition(sourceHandler),
    },
    validateEvent: {
        'flip-response': (_controllers, _sourceHandler, event) => event,
    }
});