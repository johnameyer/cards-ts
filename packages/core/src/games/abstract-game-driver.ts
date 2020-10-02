import { AbstractGameState } from './abstract-game-state';
import { Message } from './message';
import { AbstractHandler } from './abstract-handler';
import { AbstractStateTransformer } from './abstract-state-transformer';
import { HandlerProxy } from './handler-proxy';
import { AbstractResponseValidator } from './abstract-response-validator';

/**
 * Class that handles the steps of the game
 */
export abstract class AbstractGameDriver<HandlerData, Handler extends AbstractHandler<HandlerData, ResponseMessage>, GameParams, State, GameState extends AbstractGameState<GameParams, State>, ResponseMessage extends Message, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>, ResponseValidator extends AbstractResponseValidator<GameParams, State, GameState, ResponseMessage>> {

    protected handlerProxy: HandlerProxy<HandlerData, ResponseMessage, Handler, GameParams, State, GameState, StateTransformer>;

    /**
     * Create the game driver
     * @param players the players in the game
     * @param gameParams the parameters to use for the game
     */
    constructor(handlers: Handler[], public gameState: GameState, protected stateTransformer: StateTransformer, protected responseValidator: ResponseValidator) {
        // this.gameState.names = handlerProxy.getNames();
        this.handlerProxy = new HandlerProxy(handlers, stateTransformer);
    }

    private handleEvent(position: number, message: ResponseMessage) {
        const updatedMessage = this.responseValidator.validate(this.gameState, position, message);

        if(updatedMessage) {
            let canContinue: boolean;
            ([canContinue, this.gameState] = this.stateTransformer.merge(this.gameState, position, updatedMessage));
            return canContinue;
        }
        return false;
    }

    public async handleOutgoing() {
        await this.handlerProxy.handleOutgoing();
    }

    public handleSyncResponses() {
        let shouldContinue = false;
        for(const [position, message] of this.handlerProxy.receiveSyncResponses()) {
            shouldContinue ||= this.handleEvent(position, message);
        }
        return shouldContinue;
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
        const state = this.gameState;
        while(!state.completed) {
            const waitingForUser = this.iterate();
            await this.handlerProxy.handleOutgoing();
            let shouldContinue = this.handleSyncResponses();

            while(!state.completed && waitingForUser && !shouldContinue) {
                await this.handlerProxy.asyncResponseAvailable();
                for await(const [position, message] of this.handlerProxy.receiveAsyncResponses()) {
                    shouldContinue ||= this.handleEvent(position, message);
                }
            }
        }
    }

    /**
     * Runs the game until the next time it would have to wait
     */
    public resume() {
        const state = this.gameState;
        while(!state.completed) {
            const waitingForUser = this.iterate();
            if(waitingForUser) {
                return;
            }
        }
    }

    /**
     * Proceed to the next state of the game
     * @returns true if waiting for user input, false if not
     */
    public abstract iterate(): boolean;
}