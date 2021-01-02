import { AbstractStateTransformer } from '@cards-ts/core';
import { GameParams } from './game-params';
import { GameState } from './game-state';
import { HandlerData } from './handler-data';
import { ResponseMessage } from './messages/response-message';

export class StateTransformer extends AbstractStateTransformer<GameParams, GameState.State, HandlerData, GameState, ResponseMessage> {
    initialState({ names, gameParams }: { names: string[], gameParams: GameParams }) {
        const state = super.initialState({ names, gameParams, initialState: GameState.State.START_GAME });

        state.playedCards = names.map(() => []);
        state.battleCount = 0;

        return state;
    }
    
    transformToHandlerData(gameState: GameState, position: number): HandlerData {
        const handlerData: HandlerData = {
            gameParams: {...gameState.gameParams},
            numPlayers: gameState.numPlayers,
            playedCards: gameState.playedCards.map(arr => arr.slice()),
            data: gameState.data[position]
        };
        return handlerData;
    }

    merge(gameState: GameState, sourceHandler: number, incomingEvent: ResponseMessage): GameState {
        switch(incomingEvent.type) {
            case 'flip-response': {
                const newState: GameState = {
                    ...gameState,
                    data: [...gameState.data.slice(0, sourceHandler) || [], incomingEvent.data, ...gameState.data.slice(sourceHandler + 1) || []]
                };
                if(!Array.isArray(gameState.waiting)) {
                    throw new Error('waiting is not an array, got: ' + gameState.waiting);
                }
                gameState.waiting.splice(gameState.waiting.indexOf(sourceHandler), 1);
                return newState;
            }
            case 'data-response': {
                const newState: GameState = {
                    ...gameState,
                    data: [...gameState.data.slice(0, sourceHandler) || [], incomingEvent.data, ...gameState.data.slice(sourceHandler + 1) || []]
                };
                return newState;
            }
        }
    }
}