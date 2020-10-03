import { GenericGameState } from './generic-game-state';
import { Message } from './message';

/**
 * Class responsible for checking whether a response from a client is valid and returning a valid response otherwise
 */
export interface GenericResponseValidator<GameParams, State, GameState extends GenericGameState<GameParams, State>, ResponseMessage extends Message> {
    validate(gameState: GameState, sourceHandler: number, event: ResponseMessage): ResponseMessage | undefined;
}