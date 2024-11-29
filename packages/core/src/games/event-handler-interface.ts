import { Message } from '../messages/message.js';
import { Serializable } from '../intermediary/serializable.js';
import { Card } from '../cards/card.js';
import { DataController, HandsController, IndexedControllers, TricksController, TurnController, WaitingController } from '../controllers/index.js';

/**
 * Class for validating and merging incoming events
 * @typeParam Controllers the state controllers for this game
 * @typeParam ResponseMessage the response messages this game expects
 * @category Game Builder
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
/**
 * Builds the event handler interface by combining various validators and merger components together
 * @typeParam Controllers the state controllers for this game
 * @typeParam ResponseMessage the response messages this game expects
 * @category Game Builder
 */
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

/**
 * A set of utility functions that are helpful when writing event handlers
 * @category Game Builder
 */
export namespace EventHandler {
    /**
     * Creates a canRespond validator to test if it is the message source's turn
     * @param key The key of the turn controller to use
     * @returns A canRespond validator
     */
    export const isTurn = <Controllers extends IndexedControllers, ResponseMessage extends Message> (key: KeysOfType<Controllers, TurnController>): EventHandler<Controllers, ResponseMessage, boolean> => {
        return (controllers, source, _incomingEvent) => source === (controllers[key] as unknown as TurnController).get();
    };

    /**
     * Creates a canRespond validator to test if the game is waiting on the source handler
     * @param key The key of the waiting controller to use
     * @returns A canRespond validator
     */
    export const isWaiting = <Controllers extends IndexedControllers, ResponseMessage extends Message> (key: KeysOfType<Controllers, WaitingController>): EventHandler<Controllers, ResponseMessage, boolean> => {
        return (controllers, source, _incomingEvent) => (controllers[key] as unknown as WaitingController).isWaitingOnPlayerSubset([ source ]);
    };

    /**
     * Creates a validator to see if the source handler has a card they are attempting to play
     * @param key The key of the hands controller to use
     * @param cards A function that extracts the card from the response message
     * @returns A validator
     */
    export const hasCard = <Controllers extends IndexedControllers, ResponseMessage extends Message> (key: KeysOfType<Controllers, HandsController>, card: (message: ResponseMessage) => Card) => validate<Controllers, ResponseMessage>(
        'Cannot pick a card the user does not have',
        (controllers, source, incomingEvent) => !(controllers[key] as unknown as HandsController).hasCard(card(incomingEvent), source),
    );

    /**
     * Creates a validator to see if the source handler has the cards they are attempting to play
     * @param key The key of the hands controller to use
     * @param cards A function that extracts the cards from the response message
     * @returns A validator
     */
    export const hasCards = <Controllers extends IndexedControllers, ResponseMessage extends Message> (key: KeysOfType<Controllers, HandsController>, cards: (message: ResponseMessage) => readonly Card[]) => validate<Controllers, ResponseMessage>(
        'Cannot pick cards the user does not have',
        (controllers, source, incomingEvent) => !(controllers[key] as unknown as HandsController).hasCards(cards(incomingEvent), source),
    );

    /**
     * Creates a simple validator using an error message
     * @param message The error message to show if the validation fails
     * @param condition The condition of when the error should be thrown (i.e. true -> error)
     * @returns A validator
     */
    export const validate = <Controllers extends IndexedControllers, ResponseMessage extends Message> (message: string, condition: EventHandler<Controllers, ResponseMessage, boolean>): EventHandler<Controllers, ResponseMessage, Error | undefined> => (controllers, sourceHandler, event) => condition(controllers, sourceHandler, event) ? new Error(message) : undefined;

    /**
     * Creates a merger function to remove the source handler from waiting
     * @param key The key of the waiting controller
     * @returns A merger
     */
    export const removeWaiting = <Controllers extends IndexedControllers, ResponseMessage extends Message> (key: KeysOfType<Controllers, WaitingController>): EventHandler<Controllers, ResponseMessage, void> => {
        return (controllers, source, _incomingEvent) => (controllers[key] as unknown as WaitingController).removePosition(source);
    };

    /**
     * Creates a merger function to remove the cards from the source handler's hand
     * @param key The key of the hand controller
     * @param cards A function that extracts the cards from the response message
     * @returns A merger
     */
    export const removeCards = <Controllers extends IndexedControllers, ResponseMessage extends Message> (key: KeysOfType<Controllers, HandsController>, cards: (message: ResponseMessage) => readonly Card[]): EventHandler<Controllers, ResponseMessage, void> => {
        return (controllers, source, incomingEvent) => (controllers[key] as unknown as HandsController).removeCards(source, cards(incomingEvent));
    };

    /**
     * Creates a merger function to set the played trick card
     * @param key The key of the tricks controller
     * @param cards A function that extracts the card from the response message
     * @returns A merger
     */
    export const setTrickPlayedCard = <Controllers extends IndexedControllers, ResponseMessage extends Message> (key: KeysOfType<Controllers, TricksController>, card: (message: ResponseMessage) => Card): EventHandler<Controllers, ResponseMessage, void> => {
        return (controllers, _source, incomingEvent) => (controllers[key] as unknown as TricksController).setPlayedCard(card(incomingEvent));
    };
}
