import { AbstractStateTransformer, Card, Deck, Meld, runFromObj } from "@cards-ts/core";
import { GameParams } from "./game-params";
import { GameState } from "./game-state";
import { HandlerData } from "./handler-data";
import { ResponseMessage } from "./messages/response-message";

export class StateTransformer extends AbstractStateTransformer<GameParams, GameState.State, HandlerData, GameState, ResponseMessage> {
    transformToHandlerData(gameState: GameState, position: number): HandlerData {
        // TODO is cloneDeep needed and should deepFreeze be used
        return {
            gameParams: GameParams.fromObj(gameState.gameParams),
            dealer: gameState.dealer,
            hand: gameState.hands[position].map(card => Card.fromObj(card)),
            numPlayers: gameState.numPlayers,
            played: gameState.played.map(runs => runs.map(run => runFromObj(run))),
            position,
            round: gameState.round,
            points: gameState.points.slice(),
            deckCard: gameState.deck.top as Card,
            wouldBeTurn: gameState.whoseAsk === gameState.whoseTurn,
            data: gameState.data[position]
        };
    }

    merge(gameState: GameState, sourceHandler: number, incomingEvent: ResponseMessage): GameState {
        switch(incomingEvent.type) {
            case 'want-card-response': {
                const newState: GameState = {
                    ...gameState,
                    wantCard: incomingEvent.wantCard,
                    data: [...gameState.data.slice(0, sourceHandler), incomingEvent.data, ...gameState.data.slice(sourceHandler + 1)]
                };
                if(!Array.isArray(gameState.waiting)) {
                    throw new Error('waiting is not an array, got: ' + gameState.waiting);
                }
                gameState.waiting.splice(gameState.waiting.indexOf(sourceHandler), 1);
                return newState;
            }
            case 'turn-card-response': {
                const newState: GameState = {
                    ...gameState,
                    toDiscard: incomingEvent.toDiscard,
                    toPlay: incomingEvent.toPlay,
                    data: [...gameState.data.slice(0, sourceHandler), incomingEvent.data, ...gameState.data.slice(sourceHandler + 1)]
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
                    data: [...gameState.data.slice(0, sourceHandler), incomingEvent.data, ...gameState.data.slice(sourceHandler + 1)]
                };
                return newState;
            }
        }
    }

    toString(state: GameState) {
        return JSON.stringify(state);
    }

    fromStr(str: string) {
        const obj = JSON.parse(str);

        // TODO better shape checking
        if(typeof obj !== 'object' || !obj) {
            throw new Error('Not an object');
        }
        if(!Array.isArray(obj.data) || !Array.isArray(obj.hands) || !Array.isArray(obj.names) || !Array.isArray(obj.played) || !Array.isArray(obj.points)) {
            throw new Error('Shape of object is wrong');
        }
        const gameState: GameState = {
            ...obj,
            deck: Deck.fromObj(obj.deck),
            hands: obj.hands.map((hand: Card[]) => hand.map(card => Card.fromObj(card))),
            played: obj.played.map((runs: Meld[]) => runs.map(run => runFromObj(run))),
        };
        return gameState;
    }

    initialState({ names, gameParams }: { names: string[], gameParams: GameParams }) {
        const state = super.initialState({ names, gameParams, initialState: GameState.State.START_GAME });
        
        state.points = new Array(names.length).fill(0, 0, names.length);
        state.dealer = 0;
        state.whoseTurn = 0;
        state.round = 0;

        return state;
    }
}