import { Deck } from '../cards/deck';
import { Card } from '../cards/card';
import { Serializable, SerializableObject } from '../intermediary/serializable';

/**
 * A class used to track the current state of the game
 */
export interface GenericGameState<GameParams extends Readonly<SerializableObject>, State extends string> extends SerializableObject {
    /**
     * The settings that a game runs under
     */
    readonly gameParams: GameParams;

    /**
     * The number of players in the game, since the actual array is stored elsewhere
     * @todo numPlayers is a field used to enable the utility methods in this file post-refactoring it is not certain if it actually needs to exist
     */
    numPlayers: number;

    /**
     * The names of all the players
     */
    names: string[];

    /**
     * The cards of all hands
     */
    hands: Card[][];

    /**
     * The deck currently in use
     */
    deck: Deck;

    /**
     * The current state of the game, for the game state iterator
     */
    state: State;

    /**
     * Field indicating who the game is waiting on, whether it be a number of players or some specific players (by position)
     */
    waiting: number | number[];

    /**
     * Field indicating which of the hands have already responded
     */
    responded: boolean[];

    /**
     * Whether the game is completed
     */
    completed: boolean;

    /**
     * Field for the handlers to save their custom data (since they are meant to be stateless)
     */
    data: Serializable[];
}