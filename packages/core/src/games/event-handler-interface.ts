import { Message } from '../messages/message.js';
import { IndexedControllers } from '../controllers/controller.js';

/**
 * Abstract class for validating and merging incoming events
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
    merge(this: void, controllers: Controllers, sourceHandler: number, incomingEvent: ResponseMessage): void;
}
