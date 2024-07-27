import { Message } from '../messages/message.js';
import { IndexedControllers } from '../controllers/controller.js';
import { WaitingController } from '../controllers/waiting-controller.js';
import { TurnController } from '../controllers/turn-controller.js';
import { Serializable } from '../intermediary/serializable.js';
import { DataController } from '../controllers/data-controller.js';

/**
 * Class for validating and merging incoming events
 * @typeParam Controllers the state controllers for this game
 * @typeParam ResponseMessage the response messages this game expects
 */
export interface EventHandlerInterface<Controllers extends IndexedControllers, ResponseMessage extends Message> {
    /**
     * Tells whether the incoming event is valid or not and makes default moves for the players
     * @param controllers the current game state
     * @param sourceHandler the handler or player the event is coming in from
     * @param event the incoming event
     * @returns undefined if the event is to be ignored or otherwise the event that should be merged
     */
    validateEvent(this: void, controllers: Controllers, sourceHandler: number, event: ResponseMessage): ResponseMessage | undefined;

    /**
     * Consolidate an incoming event with the game state
     * @param controllers the current state
     * @param sourceHandler the handler or player generating the event
     * @param incomingEvent the changing event
     */
    merge(this: void, controllers: Controllers, sourceHandler: number, incomingEvent: ResponseMessage | undefined, data: Record<string, Serializable> | undefined): void;
}

type EventHandler<Controllers extends IndexedControllers, ResponseMessage extends Message, Result> =
    (this: void, controllers: Controllers, sourceHandler: number, event: ResponseMessage) => Result;

type SingularOrArray<T> = T | T[];

// TODO naming
type Validator<Controllers extends IndexedControllers, ResponseMessage extends Message> = EventHandler<Controllers, ResponseMessage, ResponseMessage> | {
    validators: SingularOrArray<EventHandler<Controllers, ResponseMessage, Error | undefined>>,
    fallback?: EventHandler<Controllers, ResponseMessage, ResponseMessage>,
};

type EventHandlers<Controllers extends IndexedControllers, ResponseMessage extends Message> = {
    // TODO build generically across event types
    transform?: {
        [Message in ResponseMessage as Message['type']]: (event: Message) => Message
    },
    canRespond?: {
        [Message in ResponseMessage as Message['type']]?: SingularOrArray<EventHandler<Controllers, Message, boolean>>;
    },
    validateEvent: {
        [Message in ResponseMessage as Message['type']]?: Validator<Controllers, Message>;
    };
    merge: {
        [Message in ResponseMessage as Message['type']]?: SingularOrArray<EventHandler<Controllers, Message, void>>;
    },
}

export const buildEventHandler = <Controllers extends IndexedControllers & {data: DataController}, ResponseMessage extends Message> (handlers: EventHandlers<Controllers, ResponseMessage>): EventHandlerInterface<Controllers, ResponseMessage> => ({
    // @ts-ignore
    validateEvent: (controllers, sourceHandler, incomingEvent) => {
        const type = incomingEvent.type as ResponseMessage['type'];
        if(handlers.canRespond && handlers.canRespond[type]) {
            const canRespondObj = handlers.canRespond[type];
            for(const validator of Array.isArray(canRespondObj) ? canRespondObj : [ canRespondObj ]) {
                const result = validator(controllers, sourceHandler, incomingEvent);
                if(!result) {
                    /*
                     * @ts-ignore
                     * console.warn('Error!');
                     * console.warn('Error:', result, incomingEvent.toDiscard, controllers.deck.toDiscard);
                     */
                    return undefined;
                }
            }
        }
        // @ts-ignore
        const validatorObj = handlers.validateEvent[type] as Validator<Controllers, ResponseMessage>;
        if(validatorObj === undefined) {
            // @ts-ignore
            return (handlers.transform && handlers.transform[type]) ? handlers.transform[type](incomingEvent) : incomingEvent;
        } else if(typeof validatorObj === 'function') {
            return validatorObj(controllers, sourceHandler, incomingEvent);
        } 
        let passed = true;
        for(const validator of Array.isArray(validatorObj.validators) ? validatorObj.validators : [ validatorObj.validators ]) {
            const result = validator(controllers, sourceHandler, incomingEvent);
            if(result) {
                console.warn('Error:', result.message);
                passed = false;
                break;
            }
        }
        if(passed) {
            // @ts-ignore
            return (handlers.transform && handlers.transform[type]) ? handlers.transform[type](incomingEvent) : incomingEvent;
        } 
        return validatorObj.fallback ? validatorObj.fallback(controllers, sourceHandler, incomingEvent) : undefined;
        
    },
    merge: (controllers, sourceHandler, incomingEvent, data) => {
        // TODO move upstream?
        if(data) {
            controllers.data.setDataFor(sourceHandler, data);
        }
        if(incomingEvent) { // can be undefined if the event is just data
            const type = incomingEvent.type as ResponseMessage['type'];
            // @ts-ignore
            for(const merge of Array.isArray(handlers.merge[type]) ? handlers.merge[type] : [ handlers.merge[type] ]) {
                merge(controllers, sourceHandler, incomingEvent);
            }
        }
    },
});

type KeysOfType<T, V> = {
    [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export namespace EventHandler {
    export const isTurn = <Controllers extends IndexedControllers, ResponseMessage extends Message> (key: KeysOfType<Controllers, TurnController>): EventHandler<Controllers, ResponseMessage, boolean> => {
        return (controllers, source, _incomingEvent) => source === (controllers[key] as unknown as TurnController).get();
    };

    export const isWaiting = <Controllers extends IndexedControllers, ResponseMessage extends Message> (key: KeysOfType<Controllers, WaitingController>): EventHandler<Controllers, ResponseMessage, boolean> => {
        return (controllers, source, _incomingEvent) => (controllers[key] as unknown as WaitingController).isWaitingOnPlayerSubset([ source ]);
    };

    export const validate = <Controllers extends IndexedControllers, ResponseMessage extends Message> (message: string, condition: EventHandler<Controllers, ResponseMessage, boolean>): EventHandler<Controllers, ResponseMessage, Error | undefined> => (controllers, sourceHandler, event) => condition(controllers, sourceHandler, event) ? new Error(message) : undefined;

    export const removeWaiting = <Controllers extends IndexedControllers, ResponseMessage extends Message> (key: KeysOfType<Controllers, WaitingController>): EventHandler<Controllers, ResponseMessage, void> => {
        return (controllers, source, _incomingEvent) => (controllers[key] as unknown as WaitingController).removePosition(source);
    };
}
