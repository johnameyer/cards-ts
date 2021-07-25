import { Card } from '../cards/card';
import { Deck } from '../cards/deck';
import { GenericGameState } from './generic-game-state';
import { Message } from '../messages/message';
import { SerializableObject } from '../intermediary/serializable';

/**
 * Abstract class for transforming a game's state into various forms
 */
export abstract class AbstractStateTransformer<GameParams extends SerializableObject, State extends string, HandlerData, GameState extends GenericGameState<GameParams, State>, ResponseMessage extends Message> {

    /**
     * Initializes a new game state
     * @param gameParams the parameters to use
     * @param names the names of the players
     * @param initialState the initial state of the state machine 
     */
    initialState({gameParams, names, initialState}: {gameParams: GameParams; names: string[]; initialState: State}): GameState {
        return {
            gameParams,
            numPlayers: names.length,
            names,
            completed: false,
            data: names.map(() => ({})),
            hands: names.map(() => []),
            state: initialState,
        } as any as GameState;
    }

    /**
     * Convert the state into a form for the handlers
     */
    abstract transformToHandlerData(gameState: GameState, position: number): HandlerData;

    /**
     * Consolidate an incoming event with the game state
     * @param gameState the current state
     * @param sourceHandler the handler or player generating the event
     * @param incomingEvent the changing event
     */
    abstract merge(gameState: GameState, sourceHandler: number, incomingEvent: ResponseMessage): GameState;
}
