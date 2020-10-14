import { GenericGameState } from './generic-game-state';
import { GenericHandler } from './generic-handler';
import { AbstractStateTransformer } from './abstract-state-transformer';
import { HandlerProxy } from './handler-proxy';
import { Message } from './message';

/**
 * Interface for describing the changes in the state of the game and the effect on the game state
 */
export interface GenericGameStateIterator<HandlerData, ResponseMessage extends Message, Handler extends GenericHandler<HandlerData, ResponseMessage>, GameParams, State, GameState extends GenericGameState<GameParams, State>, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>> {
    /**
     * Proceed to the next state of the game
     * @returns true if waiting for user input, false if not
     */
    iterate(gameState: GameState, handlerProxy: HandlerProxy<HandlerData, ResponseMessage, Handler, GameParams, State, GameState, StateTransformer>): void;
}