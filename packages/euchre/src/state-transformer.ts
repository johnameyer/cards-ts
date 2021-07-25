import { AbstractStateTransformer, Card } from '@cards-ts/core';
import { GameParams } from './game-params';
import { GameState } from './game-state';
import { HandlerData } from './handler-data';
import { ResponseMessage } from './messages/response-message';

export class StateTransformer extends AbstractStateTransformer<GameParams, GameState.State, HandlerData, GameState, ResponseMessage> {
    initialState({ names, gameParams }: { names: string[], gameParams: GameParams }) {
        const state = super.initialState({ names, gameParams, initialState: GameState.State.START_GAME });

        state.dealer = 0;
        state.tricks = 0;
        state.points = names.map(() => 0);

        return state;
    }
    
    transformToHandlerData(gameState: GameState, position: number): HandlerData {
        const handlerData: HandlerData = {
            gameParams: {...gameState.gameParams},
            numPlayers: gameState.numPlayers,
            pointsTaken: gameState.tricksTaken,
            points: gameState.points.slice(),
            tricks: gameState.tricks,
            dealer: gameState.dealer,
            whoseTurn: gameState.whoseTurn,
            leader: gameState.leader,
            flippedCard: gameState.flippedCard,
            currentTrump: gameState.currentTrump,
            currentTrick: gameState.currentTrick?.slice(),
            position,
            data: gameState.data[position],
            hand: gameState.hands[position]?.slice()
        };
        return handlerData;
    }

    merge(gameState: GameState, sourceHandler: number, incomingEvent: ResponseMessage): GameState {
        switch(incomingEvent.type) {
            case 'order-up-response': {
                const newState: GameState = {
                    ...gameState,
                    bidder: incomingEvent.selectingTrump ? sourceHandler : undefined,
                    data: [...gameState.data.slice(0, sourceHandler) || [], incomingEvent.data, ...gameState.data.slice(sourceHandler + 1) || []]
                };
                if(!Array.isArray(gameState.waiting)) {
                    throw new Error('waiting is not an array, got: ' + gameState.waiting);
                }
                gameState.waiting.splice(gameState.waiting.indexOf(sourceHandler), 1);
                return newState;
            }
            case 'name-trump-response': {
                const newState: GameState = {
                    ...gameState,
                    currentTrump: incomingEvent.trump || gameState.currentTrump,
                    bidder: incomingEvent.trump ? sourceHandler : undefined,
                    data: [...gameState.data.slice(0, sourceHandler) || [], incomingEvent.data, ...gameState.data.slice(sourceHandler + 1) || []]
                };
                if(!Array.isArray(gameState.waiting)) {
                    throw new Error('waiting is not an array, got: ' + gameState.waiting);
                }
                gameState.waiting.splice(gameState.waiting.indexOf(sourceHandler), 1);
                return newState;
            }
            case 'going-alone-response': {
                const newState: GameState = {
                    ...gameState,
                    goingAlone: sourceHandler
                };
                return newState;
            }
            case 'dealer-discard-response': {
                const newState: GameState = {
                    ...gameState,
                    hands: [
                        ...gameState.hands.slice(0, sourceHandler),
                        gameState.hands[sourceHandler].filter(card => !card.equals(incomingEvent.selected)),
                        ...gameState.hands.slice(sourceHandler + 1)
                    ],
                    data: [...gameState.data.slice(0, sourceHandler) || [], incomingEvent.data, ...gameState.data.slice(sourceHandler + 1) || []]
                };
                if(!Array.isArray(gameState.waiting)) {
                    throw new Error('waiting is not an array, got: ' + gameState.waiting);
                }
                gameState.waiting.splice(gameState.waiting.indexOf(sourceHandler), 1);
                return newState;
            }
            case 'turn-response': {
                const newState: GameState = {
                    ...gameState,
                    playedCard: incomingEvent.card,
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