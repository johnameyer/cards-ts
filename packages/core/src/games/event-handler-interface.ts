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

type TypeHandlers<Controllers extends IndexedControllers, ResponseMessage extends Message> = {
    // TODO build generically across event types
    transform?: (event: ResponseMessage) => ResponseMessage,
    canRespond?: SingularOrArray<EventHandler<Controllers, ResponseMessage, boolean>>;
    validateEvent?: Validator<Controllers, ResponseMessage>;
    merge: SingularOrArray<EventHandler<Controllers, ResponseMessage, void>>;
};

type EventHandlers<Controllers extends IndexedControllers, ResponseMessage extends Message> = {
    [Message in ResponseMessage as Message['type']]?: TypeHandlers<Controllers, Message>
}

type Unarray<T> = T extends Array<infer U> ? U : T;

function asArray<T>(t: T): Array<Unarray<T>> {
    if(Array.isArray(t)) {
        return t;
    } 
    // @ts-ignore
    return [ t ];
    
}

export const buildEventHandler = <Controllers extends IndexedControllers & {data: DataController}, ResponseMessage extends Message> (handlers: EventHandlers<Controllers, ResponseMessage>): EventHandlerInterface<Controllers, ResponseMessage> => ({
    validateEvent: (controllers, sourceHandler, incomingEvent) => {
        // @ts-ignore
        const typeHandlers = handlers[incomingEvent.type as ResponseMessage['type']] as TypeHandlers<Controllers, ResponseMessage>;

        if(typeHandlers.canRespond) {
            for(const validator of asArray(typeHandlers.canRespond)) {
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
        if(typeHandlers.validateEvent === undefined) {
            return (typeHandlers.transform) ? typeHandlers.transform(incomingEvent) : incomingEvent;
        } else if(typeof typeHandlers.validateEvent === 'function') {
            return typeHandlers.validateEvent(controllers, sourceHandler, incomingEvent);
        } 
        let passed = true;
        for(const validator of asArray(typeHandlers.validateEvent.validators)) {
            const result = validator(controllers, sourceHandler, incomingEvent);
            if(result) {
                console.warn('Error:', result.message);
                passed = false;
                break;
            }
        }
        if(passed) {
            return (typeHandlers.transform) ? typeHandlers.transform(incomingEvent) : incomingEvent;
        } 
        return typeHandlers.validateEvent.fallback ? typeHandlers.validateEvent.fallback(controllers, sourceHandler, incomingEvent) : undefined;
        
    },
    merge: (controllers, sourceHandler, incomingEvent, data) => {
        // TODO move upstream?
        if(data) {
            controllers.data.setDataFor(sourceHandler, data);
        }
        if(incomingEvent) { // can be undefined if the event is just data
            // @ts-ignore
            const typeHandlers = handlers[incomingEvent.type as ResponseMessage['type']] as TypeHandlers<Controllers, ResponseMessage>;
            for(const merge of asArray(typeHandlers.merge)) {
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
