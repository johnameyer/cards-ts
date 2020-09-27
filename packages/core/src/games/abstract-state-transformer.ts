import { Card } from "../cards/card";
import { Deck } from "../cards/deck";
import { AbstractGameState } from "./abstract-game-state";
import { AbstractHandlerData } from "./abstract-handler-data";
import { Message } from "./message";

export abstract class AbstractStateTransformer<GameParams, State, HandlerData extends AbstractHandlerData, GameState extends AbstractGameState<GameParams, State>, ResponseMessage extends Message> {
    
    initialState({gameParams, numPlayers, initialState}: {gameParams: GameParams, numPlayers: number, initialState: State}): GameState {
        return {
            gameParams: gameParams,
            numPlayers: numPlayers,
            names: new Array(numPlayers),
            completed: false,
            data: new Array(numPlayers).fill(0).map(() => ({})),
            hands: new Array(numPlayers).fill(0).map(() => new Array()),
            state: initialState,
        } as GameState;
    }

    fromStr(str: string): GameState {
        const obj = JSON.parse(str);
        // TODO better shape checking
        if(!(obj instanceof Object)) {
            throw new Error('Not an object');
        }
        if(!Array.isArray(obj.data) || !Array.isArray(obj.hands) || !Array.isArray(obj.names) || !Array.isArray(obj.played) || !Array.isArray(obj.scores)) {
            throw new Error('Shape of object is wrong');
        }

        return {
            gameParams: obj.gameParams,
            completed: obj.completed,
            data: obj.data,
            deck: Deck.fromObj(obj.deck),
            hands: obj.hands.map((hand: Card[]) => hand.map(card => Card.fromObj(card))),
            names: obj.names,
            numPlayers: obj.numPlayers,
            state: obj.state,
        } as GameState;
    }

    toString(state: GameState) {
        return JSON.stringify(state);
    }

    abstract transformToHandlerData(gameState: GameState, position: number): HandlerData;

    abstract merge(gameState: GameState, incomingEvent: ResponseMessage): GameState;
}