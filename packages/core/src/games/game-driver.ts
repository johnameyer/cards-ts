import { GenericGameState } from './generic-game-state';
import { Message } from './message';
import { GenericHandler } from './generic-handler';
import { AbstractStateTransformer } from './abstract-state-transformer';
import { HandlerProxy } from './handler-proxy';
import { GenericResponseValidator } from './generic-response-validator';
import { GenericGameStateIterator } from './generic-game-state-iterator';

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

    public async handleOutgoing() {
        await this.handlerProxy.handleOutgoing();
    }

    public handleSyncResponses() {
        let shouldContinue = false;
        for(const [position, message] of this.handlerProxy.receiveSyncResponses()) {
            this.handleEvent(position, message);
        }
    }

    public async asyncResponseAvailable() {
        return this.handlerProxy.asyncResponseAvailable();
    }

    public receiveAsyncResponses() {
        return this.handlerProxy.receiveAsyncResponses();
    }

    /**
     * Runs the game through to the end asyncronously
     */
    public async start() {
        while(!this.gameState.completed) {
            this.iterator.iterate(this.gameState, this.handlerProxy);

            while(!this.gameState.completed && GameDriver.isWaitingOnPlayer(this.gameState)) {
                // TODO consider this ordering
                await this.handlerProxy.handleOutgoing();
                this.handleSyncResponses();

                await this.handlerProxy.asyncResponseAvailable();
                for await(const [position, message] of this.handlerProxy.receiveAsyncResponses()) {
                    this.handleEvent(position, message);
                }
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