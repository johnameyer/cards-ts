import { AbstractGameState } from './abstract-game-state';
import { Message } from './message';
import { AbstractHandler } from './abstract-handler';
import { AbstractStateTransformer } from './abstract-state-transformer';
import { HandlerProxy } from './handler-proxy';
import { isNestedArray } from '../util/is-nested-array';
import { AbstractResponseValidator } from './abstract-response-validator';

/**
 * Class that handles the steps of the game
 */
export abstract class AbstractGameDriver<HandlerData, Handler extends AbstractHandler<HandlerData>, GameParams, State, GameState extends AbstractGameState<GameParams, State>, ResponseMessage extends Message, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>> {

    protected handlerProxy: HandlerProxy<HandlerData, Handler, GameParams, State, GameState, ResponseMessage, StateTransformer>;

    /**
     * Create the game driver
     * @param players the players in the game
     * @param gameParams the parameters to use for the game
     */
    constructor(handlers: Handler[], protected gameState: GameState, protected stateTransformer: StateTransformer) {
        // this.gameState.names = handlerProxy.getNames();
        this.handlerProxy = new HandlerProxy(handlers, stateTransformer);
    }

    /**
     * Runs the game through to the end asyncronously
     */
    public async start() {
        const state = this.gameState;
        while(!state.completed) {
            const next = this.iterate();
            await this.handlerProxy.handleOutgoing();
            if(next !== undefined) {
                if(isNestedArray(next)) {
                    const items = next.map(([number, item]) => Promise.resolve(item).then(item => [number, item] as [number, ResponseMessage]));
                    let shouldContinue: boolean = false;
                    while(!shouldContinue) {
                        const [promise] = await Promise.race(items.map(promise => promise.then(() => [promise])));
                        items.splice(items.indexOf(promise), 1);
                        const [player, response] = await promise;
                        // const validated = validator.validate(this.gameState, player, response);
                        ([shouldContinue, this.gameState] = this.stateTransformer.merge(this.gameState, player, response));
                    }
                } else {
                    const [player, response] = next;
                    ([, this.gameState] = this.stateTransformer.merge(this.gameState, player, await response));
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
            const next = this.iterate();
            if(next !== undefined) {
                return next;
            }
        }
    }

    /**
     * Proceed to the next state of the game
     * @returns void if the state is not waiting for a user, or a promise to the data returned from a user
     */
    public abstract iterate(): void | [number, ResponseMessage | Promise<ResponseMessage>] | [number, ResponseMessage | Promise<ResponseMessage>][];
}