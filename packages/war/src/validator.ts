import { Suit, GenericValidator, Card, Rank, distinct, isDefined } from "@cards-ts/core";
import { GameParams } from "./game-params";
import { GameState } from "./game-state";
import { ResponseMessage } from "./messages/response-message";
import { FlipResponseMessage } from "./messages/response/flip-response-message";

export class Validator implements GenericValidator<GameParams, GameState.State, GameState, ResponseMessage> {
    validateEvent(_gameState: GameState, _source: number, event: ResponseMessage): ResponseMessage | undefined {
        switch(event.type) {
            case 'flip-response': {
                return event;
            }
            case 'data-response': {
                return event;
            }
        }
    }

    validateState(gameState: GameState): void {
        // TODO better shape checking, maybe with GH-60
        if(typeof gameState !== 'object') {
            throw new Error('Not an object');
        }
        if(!Array.isArray(gameState.data) || !Array.isArray(gameState.hands) || !Array.isArray(gameState.names)) {
            throw new Error('Shape of object is wrong');
        }
        if(!Array.isArray(gameState.playedCards)) {
            throw new Error('Shape of object is wrong');
        }
    }
}