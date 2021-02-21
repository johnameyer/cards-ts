import { AbstractStateTransformer, Card } from '@cards-ts/core';
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

    fromStr(str: string): GameState {
        const obj = JSON.parse(str);
        // TODO better shape checking
        if(!(obj instanceof Object)) {
            throw new Error('Not an object');
        }
        if((obj.passed && !Array.isArray(obj.passed)) || (obj.currentTrick && !Array.isArray(obj.currentTrick))) {
            throw new Error('Shape of object is wrong');
        }

        return {
            ...obj,
            ...super.fromStr(str),
            pointsTaken: obj.pointsTaken,
            passed: obj.passed ? obj.passed.map((pass: Card[]) => pass ? pass.map(card => Card.fromObj(card)) : pass) : undefined,
            playedCard: obj.playedCard ? Card.fromObj(obj.playedCard) : undefined,
            currentTrick: obj.currentTrick ? obj.currentTrick.map((card: any) => Card.fromObj(card)) : undefined
        }
    }
    
    transformToHandlerData(gameState: GameState, position: number): HandlerData {
        const handlerData: HandlerData = {
            gameParams: {...gameState.gameParams},
            numPlayers: gameState.numPlayers,
            pointsTaken: gameState.pointsTaken,
            points: gameState.points.slice(),
            tricks: gameState.tricks,
            dealer: gameState.dealer,
            whoseTurn: gameState.whoseTurn,
            leader: gameState.leader,
            passed: gameState.passed[position]?.slice(),
            pass: gameState.pass,
            currentTrick: gameState.currentTrick?.slice(),
            position,
            data: gameState.data[position],
            hand: gameState.hands[position]?.slice()
        };
        return handlerData;
    }

    merge(gameState: GameState, sourceHandler: number, incomingEvent: ResponseMessage): GameState {
        switch(incomingEvent.type) {
            case 'pass-response': {
                const newState: GameState = {
                    ...gameState,
                    passed: [...gameState.passed.slice(0, sourceHandler) || [], incomingEvent.cards, ...gameState.passed.slice(sourceHandler + 1) || []],
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