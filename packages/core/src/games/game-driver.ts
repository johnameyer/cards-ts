import { GenericGameState } from './generic-game-state';
import { Message } from './message';
import { GenericHandler } from './generic-handler';
import { AbstractStateTransformer } from './abstract-state-transformer';
import { HandlerProxy } from './handler-proxy';
import { GenericResponseValidator } from './generic-response-validator';
import { GenericGameStateIterator } from './generic-game-state-iterator';
import { zip } from '../util/zip';

/**
 * Class that handles the steps of the game
 */
export class GameDriver<HandlerData, Handler extends GenericHandler<HandlerData, ResponseMessage>, GameParams, State, GameState extends GenericGameState<GameParams, State>, ResponseMessage extends Message, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>, ResponseValidator extends GenericResponseValidator<GameParams, State, GameState, ResponseMessage>> {
    static isWaitingOnPlayer<GameParams, State>(state: GenericGameState<GameParams, State>) {
        if(Array.isArray(state.waiting)) {
            return state.waiting.length !== 0;
        } else {
            return state.waiting <= 0;
        }
    }

    static isWaitingOnPlayerSubset<GameParams, State>(state: GenericGameState<GameParams, State>, subset: number[]) {
        if(Array.isArray(state.waiting)) {
            return state.waiting.length !== 0 && state.waiting.some(position => subset.includes(position));
        } else {
            return state.waiting <= 0 && subset.some(position => !state.responded[position]);
        }
    }

    protected handlerProxy: HandlerProxy<HandlerData, ResponseMessage, Handler, GameParams, State, GameState, StateTransformer>;

    /**
     * Create the game driver
     * @param players the players in the game
     * @param gameParams the parameters to use for the game
     */
    constructor(handlers: Handler[], public gameState: GameState, protected iterator: GenericGameStateIterator<HandlerData, ResponseMessage, Handler, GameParams, State, GameState, StateTransformer>, protected stateTransformer: StateTransformer, protected responseValidator: ResponseValidator) {
        // this.gameState.names = handlerProxy.getNames();
        this.handlerProxy = new HandlerProxy(handlers, stateTransformer);
    }

    private handleEvent(position: number, message: ResponseMessage) {
        const updatedMessage = this.responseValidator.validate(this.gameState, position, message);

        if(updatedMessage) {
            this.gameState = this.stateTransformer.merge(this.gameState, position, updatedMessage);
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
            this.handleEvent(position, message);
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

    isWaitingOnPlayer() {
        return GameDriver.isWaitingOnPlayer(this.gameState);
    }

    isWaitingOnPlayerSubset(subset: number[]) {
        return GameDriver.isWaitingOnPlayerSubset(this.gameState, subset);
    }

    /**
     * Runs the game through to the end asynchronously
     */
    public async start() {
        while(!this.gameState.completed) {
            this.iterator.iterate(this.gameState, this.handlerProxy);

            // TODO consider this ordering
            await this.handlerProxy.handleOutgoing();
            this.handleSyncResponses();

            while(!this.gameState.completed && GameDriver.isWaitingOnPlayer(this.gameState)) {

                await this.handlerProxy.asyncResponseAvailable();
                for await(const [position, message] of this.handlerProxy.receiveAsyncResponses()) {
                    this.handleEvent(position, message);
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
        while(!this.gameState.completed && !GameDriver.isWaitingOnPlayer(this.gameState)) {
            this.iterator.iterate(this.gameState, this.handlerProxy);
        }
    }
}