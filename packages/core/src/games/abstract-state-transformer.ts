import { Card } from '../cards/card';
import { Deck } from '../cards/deck';
import { GenericGameState } from './generic-game-state';
import { Message } from './message';

export abstract class AbstractStateTransformer<GameParams, State, HandlerData, GameState extends GenericGameState<GameParams, State>, ResponseMessage extends Message> {

    initialState({gameParams, names, initialState}: {gameParams: GameParams, names: string[], initialState: State}): GameState {
        return {
            gameParams,
            numPlayers: names.length,
            names,
            completed: false,
            data: names.map(() => ({})),
            hands: names.map(() => new Array()),
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

    abstract merge(gameState: GameState, sourceHandler: number, incomingEvent: ResponseMessage): GameState;
}