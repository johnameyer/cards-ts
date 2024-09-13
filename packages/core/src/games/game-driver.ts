import { Message } from '../messages/message.js';
import { SystemHandlerParams } from '../handlers/system-handler.js';
import { CompletedController, GameStateController, WaitingController } from '../controllers/index.js';
import { IndexedControllers } from '../controllers/controller.js';
import { Serializable } from '../intermediary/serializable.js';
import { GenericGameStateTransitions } from './generic-game-state-transitions.js';
import { EventHandlerInterface } from './event-handler-interface.js';
import { GenericGameState } from './generic-game-state.js';
import { GenericHandlerProxy } from './generic-handler-controller.js';
import { STANDARD_STATES } from './game-states.js';

/**
 * Class that steps though the game using the game state transitions
 *
 * Shouldn't be manually constructed - game factory should handle
 * @typeParam Handlers the custom event handlers that this game has
 * @typeParam State the state enum for this game
 * @typeParam Controllers the state controllers for this game
 * @typeParam ResponseMessage the response messages this game expects
 * @typeParam EventHandler the event handler for this game
 */
export class GameDriver<
    Handlers extends { [key: string]: unknown[] } & SystemHandlerParams,
    State extends typeof STANDARD_STATES,
    Controllers extends IndexedControllers & { waiting: WaitingController; completed: CompletedController; state: GameStateController<State> },
    ResponseMessage extends Message,
    EventHandler extends EventHandlerInterface<Controllers, ResponseMessage>,
> {
    /**
     * Create the game driver
     * @param handlerProxy the wrapper for the handlers
     * @param gameState the game state and controllers
     * @param transitions the transitions for the game
     * @param eventHandler the event handler for the game
     */
    constructor(
        private handlerProxy: GenericHandlerProxy<ResponseMessage, Handlers>,
        private gameState: GenericGameState<Controllers>,
        private transitions: GenericGameStateTransitions<State, Controllers>,
        private eventHandler: EventHandler,
    ) {
        // this.gameState.names = handlerProxy.getNames();
    }

    /**
     * Handle an incoming event from one of the handlers
     * @param position the position the event is coming from
     * @param message the message to handle
     * @returns if the message was merged
     */
    public handleEvent(position: number, message: ResponseMessage | undefined, data: Record<string, Serializable> | undefined) {
        // TODO move only data elsewhere
        if (message !== undefined) {
            const updatedMessage = this.eventHandler.validateEvent(this.gameState.controllers, position, message);

            if (updatedMessage) {
                this.eventHandler.merge(this.gameState.controllers, position, updatedMessage, data);
            }

            return !!updatedMessage;
        }
        this.eventHandler.merge(this.gameState.controllers, position, undefined, data);

        return false;
    }

    /**
     * Makes sure that all of the handlers are notified of changes
     */
    public async handleOutgoing() {
        await this.handlerProxy.handleOutgoing();
    }

    /**
     * Handles events coming in from local handlers
     */
    public handleSyncResponses() {
        for (const [position, message] of this.handlerProxy.receiveSyncResponses()) {
            if (message) {
                let payload, data;
                if (Array.isArray(message)) {
                    [payload, data] = message;
                } else {
                    payload = message;
                }
                this.handleEvent(position, payload, data);
            }
        }
    }

    /**
     * Tells when a response has come in asynchronously
     */
    public async asyncResponseAvailable() {
        return this.handlerProxy.asyncResponseAvailable();
    }

    /**
     * Iterates over async responses that have come in
     */
    public receiveAsyncResponses() {
        return this.handlerProxy.receiveAsyncResponses();
    }

    /*
     * Tells if the game is waiting on a player
     */
    isWaitingOnPlayer() {
        return this.gameState.controllers.waiting.isWaitingOnPlayer();
    }

    /**
     * Tells if the game is waiting on any of the following players
     * @param subset the subset to check against
     */
    isWaitingOnPlayerSubset(subset: number[]) {
        return this.gameState.controllers.waiting.isWaitingOnPlayerSubset(subset);
    }

    /**
     * Runs the game through to the end asynchronously
     */
    public async start(): Promise<void> {
        while (!this.gameState.controllers.completed.get()) {
            this.transitions[this.gameState.controllers.state.get()].call(undefined, this.gameState.controllers);

            // TODO consider this ordering
            await this.handlerProxy.handleOutgoing();
            this.handleSyncResponses();

            while (!this.gameState.controllers.completed.get() && this.isWaitingOnPlayer()) {
                await this.handlerProxy.asyncResponseAvailable();
                for await (const [position, message] of this.handlerProxy.receiveAsyncResponses()) {
                    if (message) {
                        let payload, data;
                        if (Array.isArray(message)) {
                            [payload, data] = message;
                        } else {
                            payload = message;
                        }
                        this.handleEvent(position, payload, data);
                    }
                }

                // TODO consider this ordering
                await this.handlerProxy.handleOutgoing();
                this.handleSyncResponses();
            }
        }
    }

    /**
     * Runs the game until the next time it would have to wait
     */
    public resume() {
        while (!this.gameState.controllers.completed.get() && !this.isWaitingOnPlayer()) {
            this.transitions[this.gameState.controllers.state.get()].call(undefined, this.gameState.controllers);
        }
    }

    public getState() {
        return this.gameState.state; // TODO avoid external updates here
    }
}
