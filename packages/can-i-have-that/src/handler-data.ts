import { Card, Meld } from "@cards-ts/core";
import { GameParams } from "./game-params";

/**
 * Class that contains data that is passed to the handlers every time they make their turn
 * It allows the handlers to be stateless, and contains an internal object that players may set their own data in
 */
export interface HandlerData {
    /**
     * The settings that a game runs under
     */
    gameParams: GameParams;

    /**
     * The current round
     */
    round: number;

    /**
     * The number of players in the game, since the actual array is stored elsewhere
     * @todo numPlayers is a field used to enable the utility methods in this file post-refactoring it is not certain if it actually needs to exist
     */
    numPlayers: number;

    /**
     * The scores of the hands
     */
    points: number[];

    /**
     * The cards in this hand
     */
    hand: Card[];

    /**
     * This is where the three of a kind, four card runs are played for each of the hands
     */
    played: Meld[][];

    /**
     * The index of the dealer player
     */
    dealer: number;

    /**
     * The index of this player at the table
     */
    position: number;

    wouldBeTurn: boolean;

    deckCard: Card;

    data: any;
}