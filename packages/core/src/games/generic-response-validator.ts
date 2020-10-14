import { GenericGameState } from './generic-game-state';
import { Message } from './message';

/**
 * Class responsible for checking whether a response from a client is valid and returning a valid response otherwise
 */
export interface GenericResponseValidator<GameParams, State, GameState extends GenericGameState<GameParams, State>, ResponseMessage extends Message> {
    /**
     * Tells whether the incoming event is valid or not and makes default moves for the players
     * @param gameState the current game state
     * @param sourceHandler the handler or player the event is coming in from
     * @param event the incoming event
     * @returns undefined if the event is to be ignored or otherwise the event that should be merged
     */
    validate(gameState: GameState, sourceHandler: number, event: ResponseMessage): ResponseMessage | undefined;
}