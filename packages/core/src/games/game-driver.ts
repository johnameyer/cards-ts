import { Message } from '../messages/message';
import { SystemHandlerParams } from '../handlers/system-handler';
import { CompletedController, GameStateController, WaitingController } from '../controllers';
import { IndexedControllers } from '../controllers/controller';
import { GenericGameStateTransitions } from './generic-game-state-transitions';
import { EventHandlerInterface } from './event-handler-interface';
import { GenericGameState } from './generic-game-state';
import { GenericHandlerProxy } from './generic-handler-controller';
import { STANDARD_STATES } from './game-states';

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
export class GameDriver<Handlers extends {[key: string]: unknown[]} & SystemHandlerParams, State extends typeof STANDARD_STATES, Controllers extends IndexedControllers & { waiting: WaitingController, completed: CompletedController, state: GameStateController<State> }, GameState extends GenericGameState<Controllers>, ResponseMessage extends Message, EventHandler extends EventHandlerInterface<Controllers, ResponseMessage>> {
    // TODO remove GameState from here?

    /**
     * Tells if the game is waiting on a player
     * @param state the state to analyze
     */
    static isWaitingOnPlayer(waitingController: WaitingController) {
        const { waiting } = waitingController.get();
        if(Array.isArray(waiting)) {
            return waiting.length !== 0;
        } 
        return waiting <= 0;
        
    }

    /**
     * Tells if the game is waiting on any of the following players
     * @param state the state to analyze
     * @param subset the subset to check against
     */
    static isWaitingOnPlayerSubset(waitingController: WaitingController, subset: number[]) {
        const { waiting, responded } = waitingController.get();
        if(Array.isArray(waiting)) {
            return waiting.length !== 0 && waiting.some(position => subset.includes(position));
        } 
        return waiting <= 0 && subset.some(position => !responded[position]);
    }

    /**
     * Create the game driver
     * @param handlerProxy the wrapper for the handlers
     * @param gameState the game state and controllers
     * @param transitions the transitions for the game
     * @param eventHandler the event handler for the game
     */
    constructor(private handlerProxy: GenericHandlerProxy<ResponseMessage, Handlers>, private gameState: GameState, private transitions: GenericGameStateTransitions<State, Controllers>, private eventHandler: EventHandler) {
        // this.gameState.names = handlerProxy.getNames();
    }

    /**
     * Handle an incoming event from one of the handlers
     * @param position the position the event is coming from
     * @param message the message to handle
     * @returns if the message was merged
     */
    public handleEvent(position: number, message: ResponseMessage) {
        const updatedMessage = this.eventHandler.validateEvent(this.gameState.controllers, position, message);

        if(updatedMessage) {
            this.eventHandler.merge(this.gameState.controllers, position, updatedMessage);
        }

        return !!updatedMessage;
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
        for(const [ position, message ] of this.handlerProxy.receiveSyncResponses()) {
            if(message) {
                this.handleEvent(position, message);
            }
        }
    }

    /**
     * Tells when a response has come in asyncronously
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
        return GameDriver.isWaitingOnPlayer(this.gameState.controllers.waiting);
    }

    
    /**
     * Tells if the game is waiting on any of the following players
     * @param subset the subset to check against
     */
    isWaitingOnPlayerSubset(subset: number[]) {
        return GameDriver.isWaitingOnPlayerSubset(this.gameState.controllers.waiting, subset);
    }

    /**
     * Runs the game through to the end asynchronously
     */
    public async start() {
        const transitions = this.transitions.get();
        while(!this.gameState.controllers.completed.get()) {
            transitions[this.gameState.controllers.state.get()].call(this.transitions, this.gameState.controllers);

            // TODO consider this ordering
            await this.handlerProxy.handleOutgoing();
            this.handleSyncResponses();

            while(!this.gameState.controllers.completed.get() && GameDriver.isWaitingOnPlayer(this.gameState.controllers.waiting)) {

                await this.handlerProxy.asyncResponseAvailable();
                for await (const [ position, message ] of this.handlerProxy.receiveAsyncResponses()) {
                    if(message) {
                        this.handleEvent(position, message);
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
        const transitions = this.transitions.get();
        while(!this.gameState.controllers.completed.get() && !GameDriver.isWaitingOnPlayer(this.gameState.controllers.waiting)) {
            transitions[this.gameState.controllers.state.get()].call(this.transitions, this.gameState.controllers);
        }
    }
}
