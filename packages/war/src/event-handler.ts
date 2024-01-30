import { Controllers } from './controllers/controllers.js';
import { ResponseMessage } from './messages/response-message.js';
import { EventHandlerInterface } from '@cards-ts/core';

export const eventHandler: EventHandlerInterface<Controllers, ResponseMessage> = {
    merge(controllers: Controllers, sourceHandler: number, incomingEvent: ResponseMessage): void {
        switch (incomingEvent.type) {
        case 'flip-response': {
            controllers.waiting.removePosition(sourceHandler);
            return;
        }
        }
    },

    validateEvent(_controllers: Controllers, _sourceHandler: number, event: ResponseMessage): ResponseMessage | undefined {
        switch (event.type) {
        case 'flip-response': {
            return event;
        }
        }
    },
};
