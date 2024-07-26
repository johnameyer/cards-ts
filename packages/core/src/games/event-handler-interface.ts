import { Message } from '../messages/message.js';
import { IndexedControllers } from '../controllers/controller.js';
import { DataController, Serializable } from '../browser-index.js';

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

// TODO accept array of validators and/or mergers
// validate: [TurnController.checkTurn(controllers => controllers.turn), defaulting(() => default, myCheck())]
// merge: [WaitingController.removeWaiting]
// can checkTurn default to `.turn`?
// should we have another function to wrap the default function?
// validate: { canRespond?: fn | fn[] } & ({} | { validators: fn | fn[], default: () => {} })
// or
// canRespond: fn | fn[]
// isValidEvent: fn | fn[]
// default: fn
type EventHandlers<Controllers extends IndexedControllers, ResponseMessage extends Message> = {
    validateEvent: {
        [Message in ResponseMessage as Message['type']]: (this: void, controllers: Controllers, sourceHandler: number, event: Message) => Message | undefined;
    }
    merge: {
        [Message in ResponseMessage as Message['type']]: (this: void, controllers: Controllers, sourceHandler: number, incomingEvent: Message) => void;
    },
}

export const wrapEventHandler = <Controllers extends IndexedControllers & {data: DataController}, ResponseMessage extends Message> (handlers: EventHandlers<Controllers, ResponseMessage>): EventHandlerInterface<Controllers, ResponseMessage> => ({
    //@ts-ignore
    validateEvent: (controllers, sourceHandler, incomingEvent) => handlers.validateEvent[incomingEvent.type](controllers, sourceHandler, incomingEvent),
    merge: (controllers: Controllers, sourceHandler: number, incomingEvent: ResponseMessage | undefined, data: Record<string, Serializable>) => {
        // TODO move upstream?
        controllers.data.setDataFor(sourceHandler, data);
        if (incomingEvent) { // can be undefined if the event is just data
            // @ts-ignore
            handlers.merge[incomingEvent.type](controllers, sourceHandler, incomingEvent);
        }
    },
})