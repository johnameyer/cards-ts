import { AbstractGameState } from "./abstract-game-state";
import { Message } from "./message";

/**
 * Class responsible for checking whether a response from a client is valid and returning a valid response otherwise
 */
export abstract class AbstractResponseValidator<GameParams, State, GameState extends AbstractGameState<GameParams, State>, ResponseMessage extends Message> {
    abstract validate(gameState: GameState, sourceHandler: number, event: ResponseMessage): ResponseMessage | undefined;
}