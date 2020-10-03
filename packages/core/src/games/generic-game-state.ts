import { Deck } from '../cards/deck';
import { Card } from '../cards/card';

/**
 * A class used to track the current state of the game
 */
export interface GenericGameState<GameParams, State> {
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

    state: State;

    completed: boolean;

    data: unknown[];
}