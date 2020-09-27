import { AbstractStateTransformer } from '@cards-ts/core';
import { GameParams } from './game-params';
import { GameState } from './game-state';
import { HandlerData } from './handler-data';
import { ResponseMessage } from './messages/response-message';

export class StateTransformer extends AbstractStateTransformer<GameParams, GameState.State, HandlerData, GameState, ResponseMessage> {
    initialState({ numPlayers, gameParams }: { numPlayers: number, gameParams: GameParams }) {
        const state = super.initialState({ numPlayers, gameParams, initialState: GameState.State.START_GAME });

        state.dealer = 0;
        state.pass = 1;
        state.tricks = 0;
        state.passed = [];
        state.points = new Array(numPlayers).fill(0);

        return state;
    }
    
    transformToHandlerData(gameState: GameState, position: number): HandlerData {
        const handlerData: HandlerData = {
            gameParams: {...gameState.gameParams},
            numPlayers: gameState.numPlayers,
            pointsTaken: gameState.pointsTaken,
            points: gameState.points,
            tricks: gameState.tricks,
            dealer: gameState.dealer,
            whoseTurn: gameState.whoseTurn,
            leader: gameState.leader,
            passed: gameState.passed[position],
            pass: gameState.pass,
            currentTrick: gameState.currentTrick,
            position,
            data: gameState.data[position],
            hand: gameState.hands[position]
        };
        return handlerData;
    }

    merge(gameState: GameState, incomingEvent: ResponseMessage): GameState {
        switch(incomingEvent.type) {
            case 'pass-response': {
                return {
                    ...gameState,
                    passed: [...gameState.passed.slice(0, gameState.whoseTurn), incomingEvent.cards, ...gameState.passed.slice(gameState.whoseTurn + 1)]
                };
                // TODO what if not everyone has passed
            }
            case 'turn-response': {
                return {
                    ...gameState,
                    currentTrick: [...gameState.currentTrick, incomingEvent.card]
                };
            }
        }
    }
    
}