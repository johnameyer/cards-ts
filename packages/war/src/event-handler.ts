import { EventHandlerInterface } from '@cards-ts/core';
import { Controllers } from './controllers/controllers.js';
import { ResponseMessage } from './messages/response-message.js';

export class EventHandler implements EventHandlerInterface<Controllers, ResponseMessage> {
    merge(controllers: Controllers, sourceHandler: number, incomingEvent: ResponseMessage): void {
        switch (incomingEvent.type) {
        case 'flip-response': {
            controllers.data.setDataFor(sourceHandler, incomingEvent.data);
            controllers.waiting.removePosition(sourceHandler);
            return;
        }
        case 'data-response': {
            controllers.data.setDataFor(sourceHandler, incomingEvent.data);
            return;
        }
        }
    }

    validateEvent(_controllers: Controllers, _sourceHandler: number, event: ResponseMessage): ResponseMessage | undefined {
        switch (event.type) {
        case 'flip-response': {
            return event;
        }
        case 'data-response': {
            return event;
        }
        }
    }
}
