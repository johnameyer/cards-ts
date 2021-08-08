import { Suit } from './suit';
import { Rank } from './rank';
import { ValueError } from './value-error';

/**
 * Class to represent cards in a deck
 */
export class Card {
    public readonly type = 'card';

    /**
     * Create a card from a string representation
     * @param str the string to create the card from
     * @returns the card
     */
    public static fromString(str: string): Card {
        if (str === '*') {
            return new Card(Suit.NONE, Rank.JOKER);
        }
        if (str.length < 2 || str.length > 3) {
            throw new ValueError('String is not valid card');
        }
        try {
            const card = new Card(Suit.fromString(str.substring(str.length - 1)), Rank.fromString(str.substring(0, str.length - 1)));
            return card;
        } catch {
            throw new ValueError('String is not valid card');
        }
    }

    /**
     * Create a card from an object containing the normal fields
     * @param obj the object to grab attributes from
     * @returns the card
     */
    public static fromObj(obj: any): Card {
        const rank = Rank.fromObj(obj.rank);
        if(rank === Rank.JOKER) {
            return new Card(Suit.NONE, rank, obj.deck, obj.jokerNum);
        }
        return new Card(Suit.fromObj(obj.suit), rank, obj.deck, obj.jokerNum);
    }

    /**
     * Orders cards by rank and then by suit, ignoring deck and joker number
     * @param one the first card
     * @param two the second card
     * @returns -1 if the first card comes first, 1 if the second card comes first, or 0 otherwise
     */
    public static compare(one: Card, two: Card): number {
        if (one.rank !== two.rank) {
            return Rank.compare(one.rank, two.rank);
        }
        return Suit.compare(one.suit, two.suit);
    }

    /**
     * Create a new card
     * @param suit the suit of the card
     * @param rank the rank of the card
     * @param deck reference information about the deck this card belongs to (not required)
     * @param jokerNum reference information to designate two jokers belonging to a single deck (not required)
     */
    constructor(public readonly suit: Suit,
                public readonly rank: Rank,
                public readonly deck: number = -1,
                private readonly jokerNum: number = -1,
                ) {
        Object.freeze(this);
    }

    /**
     * Get the string representation of a card
     * @returns the string representation
     */
    public toString() {
        if (this.rank === Rank.JOKER) {
            return '* (Joker)';
        }
        return this.rank.toString() + ' of ' + this.suit.toString();
    }

    /**
     * Tells whether this card is wild
     * @returns if it is wild
     */
    public isWild(): boolean {
        return this.rank.isWild();
    }

    /**
     * Tells whether two cards are equivalent, accounting for a 'template card' not containing deck or joker reference
     * @param other the card to compare to
     * @returns if the cards are equivalent
     */
    public equals(other?: any): boolean {
        if (!other) {
            return false;
        }
        if(typeof other !== typeof this) {
            return false;
        }
        if (this.deck + 1 && other.deck + 1 && this.deck !== other.deck) {
            return false;
        }
        if (this.rank === Rank.JOKER && other.rank === Rank.JOKER) { // Joker has no suit
            return !(this.jokerNum + 1) || !(other.jokerNum + 1) || this.jokerNum === other.jokerNum;
        }
        if (this.rank !== other.rank) {
            return false;
        }
        return this.suit === other.suit;
    }
}

/**
 * Array of template cards of the cards that are considered wild
 */
export const potentialWilds =  ['*', '2C', '2S', '2H', '2D'].map(Card.fromString);
