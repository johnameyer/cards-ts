import { GenericGameState } from './generic-game-state';
import { Message } from '../messages/message';
import { EventHandlerInterface } from './event-handler-interface';
import { GenericGameStateTransitions } from './generic-game-state-transitions';
import { SystemHandlerParams } from '../handlers/system-handler';
import { SerializableObject } from '../intermediary/serializable';
import { WaitingController, CompletedController, GameStateController } from '../controllers';
import { IndexedControllers } from '../controllers/controller';
import { GenericHandlerProxy } from './generic-handler-controller';
import { STANDARD_STATES } from './game-states';

/**
 * Class that handles the steps of the game
 */
export class GameDriver<Handlers extends {[key: string]: any[]} & SystemHandlerParams, State extends typeof STANDARD_STATES, Controllers extends IndexedControllers & { waiting: WaitingController, completed: CompletedController, state: GameStateController<State> }, GameState extends GenericGameState<Controllers>, ResponseMessage extends Message, EventHandler extends EventHandlerInterface<Controllers, ResponseMessage>> {
    /**
     * Tells if the game is waiting on a player
     * @param state the state to analyze
     */
    static isWaitingOnPlayer<GameParams extends SerializableObject, State extends typeof STANDARD_STATES>(waitingController: WaitingController) {
        const { waiting } = waitingController.get();
        if(Array.isArray(waiting)) {
            return waiting.length !== 0;
        } else {
            return waiting <= 0;
        }
    }

    /**
     * Tells if the game is waiting on any of the following players
     * @param state the state to analyze
     * @param subset the subset to check against
     */
    static isWaitingOnPlayerSubset<GameParams extends SerializableObject, State extends typeof STANDARD_STATES>(waitingController: WaitingController, subset: number[]) {
        const {waiting, responded} = waitingController.get();
        if(Array.isArray(waiting)) {
            return waiting.length !== 0 && waiting.some(position => subset.includes(position));
        } else {
            return waiting <= 0 && subset.some(position => !responded[position]);
        }
    }

    /**
     * Create the game driver
     * @param players the players in the game
     * @param gameParams the parameters to use for the game
     */
    constructor(protected handlerProxy: GenericHandlerProxy<ResponseMessage, Handlers>, public gameState: GameState, protected transitions: GenericGameStateTransitions<State, Controllers>, protected eventHandler: EventHandler) {
        // this.gameState.names = handlerProxy.getNames();
    }

    private handleEvent(position: number, message: ResponseMessage) {
        const updatedMessage = this.eventHandler.validateEvent(this.gameState.controllers, position, message);

        if(updatedMessage) {
            this.eventHandler.merge(this.gameState.controllers, position, updatedMessage);
        }
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
        for(const [position, message] of this.handlerProxy.receiveSyncResponses()) {
            if(message){
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
                for await(const [position, message] of this.handlerProxy.receiveAsyncResponses()) {
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
        while(!!this.gameState.controllers.completed.get() && !GameDriver.isWaitingOnPlayer(this.gameState.controllers.waiting)) {
            transitions[this.gameState.controllers.state.get()].call(this.transitions, this.gameState.controllers);
        }
    }
}