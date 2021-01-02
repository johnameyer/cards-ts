import { Suit, GenericResponseValidator, Card, Rank, distinct, isDefined } from "@cards-ts/core";
import { GameParams } from "./game-params";
import { GameState } from "./game-state";
import { ResponseMessage } from "./messages/response-message";
import { FlipResponseMessage } from "./messages/response/flip-response-message";

export class ResponseValidator implements GenericResponseValidator<GameParams, GameState.State, GameState, ResponseMessage> {
    validate(gameState: GameState, source: number, event: ResponseMessage): ResponseMessage | undefined {
        switch(event.type) {
            case 'flip-response': {
                return event;
            }
            case 'data-response': {
                return event;
            }
        }
    }
}