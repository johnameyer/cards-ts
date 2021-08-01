import { GenericGameState } from './generic-game-state';
import { AbstractStateTransformer } from './abstract-state-transformer';
import { HandlerProxy } from './handler-proxy';
import { Message } from '../messages/message';
import { SystemHandlerParams } from '../handlers/system-handler';
import { SerializableObject } from '../intermediary/serializable';

type Transition<HandlerData, ResponseMessage extends Message, Handlers extends {[key: string]: any[]} & SystemHandlerParams, GameParams extends SerializableObject, State extends string, GameState extends GenericGameState<GameParams, State>, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>> = (gameState: GameState, handlerProxy: HandlerProxy<HandlerData, ResponseMessage, Handlers, GameParams, State, GameState, StateTransformer>) => void;

/**
 * Interface for describing the changes in the state of the game and the effect on the game state
 */
export interface GenericGameStateTransitions<HandlerData, ResponseMessage extends Message, Handlers extends {[key: string]: any[]} & SystemHandlerParams, GameParams extends SerializableObject, State extends string, GameState extends GenericGameState<GameParams, State>, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>> {
    /**
     * Get the functions that transform the state, arranged by the state enum
     */
    get(): { [state in State]: Transition<HandlerData, ResponseMessage, Handlers, GameParams, State, GameState, StateTransformer> };
}