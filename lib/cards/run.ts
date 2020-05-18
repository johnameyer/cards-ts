import { Card } from './card';
/**
 * Parent class for three card sets and four card runs
 */
export abstract class Run {
    /**
     * The cards that this contains
     */
    public cards: Card[] = [];

    /**
     * Add a card to this run
     * @param card the card to add
     */
    public abstract add(card: Card): void;

    /**
     * Returns whether this card could be played in this run
     * @param card the card to check against this run
     * @returns if the card is live
     */
    public abstract isLive(card: Card): boolean;

    /**
     * Returns the array of (template) cards that would be live
     * @returns an array of cards that are live
     */
    public abstract liveCards(): Card[];

    /**
     * Clones this run using the same card objects
     * @returns the cloned run
     */
    public abstract clone(): Run;

    /**
     * Get the string representation
     * @returns the string representation
     */
    public abstract toString(): string;

    /**
     * Member variable to distinguish between types of runs
     */
    public type: number = 0;
}
