import { AbstractStateTransformer, isDefined } from '@cards-ts/core';
import { GameParams } from './game-params';
import { GameState } from './game-state';
import { HandlerData } from './handler-data';
import { ResponseMessage } from './messages/response-message';

export class StateTransformer extends AbstractStateTransformer<GameParams, GameState.State, HandlerData, GameState, ResponseMessage> {
    initialState({ names, gameParams }: { names: string[], gameParams: GameParams }) {
        const state = super.initialState({ names, gameParams, initialState: GameState.State.START_GAME });

        state.dealer = 0;
        state.pass = 1;
        state.tricks = 0;
        state.passed = [];
        state.points = names.map(() => 0);

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

    merge(gameState: GameState, source: number, incomingEvent: ResponseMessage): [shouldContinue: boolean, gameState: GameState] {
        switch(incomingEvent.type) {
            case 'pass-response': {
                const newState: GameState = {
                    ...gameState,
                    passed: [...gameState.passed.slice(0, source), incomingEvent.cards, ...gameState.passed.slice(source + 1)]
                };
                return [newState.passed.every(isDefined), newState];
            }
            case 'turn-response': {
                const newState: GameState = {
                    ...gameState,
                    playedCard: incomingEvent.card
                };
                return [true, newState];
            }
            case 'data-response': {
                const newState: GameState = {
                    ...gameState,
                    data: [...gameState.data.slice(0, source), incomingEvent.data, ...gameState.data.slice(source + 1)]
                };
                return [false, newState];
            }
        }
    }
    
}