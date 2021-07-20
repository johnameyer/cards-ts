import { GenericGameState } from './generic-game-state';
import { AbstractStateTransformer } from './abstract-state-transformer';
import { HandlerProxy } from './handler-proxy';
import { Message } from '../messages/message';
import { SystemHandlerParams } from '../handlers/system-handler';
import { SerializableObject } from '../intermediary/serializable';

/**
 * Interface for describing the changes in the state of the game and the effect on the game state
 */
export interface GenericGameStateIterator<HandlerData, ResponseMessage extends Message, Handlers extends {[key: string]: any[]} & SystemHandlerParams, GameParams extends SerializableObject, State extends string, GameState extends GenericGameState<GameParams, State>, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>> {
    /**
     * Proceed to the next state of the game
     */
    iterate(gameState: GameState, handlerProxy: HandlerProxy<HandlerData, ResponseMessage, Handlers, GameParams, State, GameState, StateTransformer>): void;
}