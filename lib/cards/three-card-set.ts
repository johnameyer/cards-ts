import { InvalidError } from './invalid-error';
import { Run } from './run';
import { Card, potentialWilds } from './card';
import { Rank } from './rank';
import { Suit } from './suit';
import { ValueError } from './value-error';

/**
 * Checks if a three card set is valid
 * @param set the set to check
 * @throws if the set is invalid
 */
function check(set: ThreeCardSet) {
    if (set.cards.length < 2 * set.wilds.length) { // 2 < count {
        throw new InvalidError('Too many wilds');
    }
    if (set.cards.length < 3) {
        throw new InvalidError('Not enough cards');
    }

    for (const card of set.cards) {
        if (card.isWild()) {
            continue;
        }
        if (card.rank !== set.rank) {
            throw new InvalidError('Card not of the right rank');
        }
    }
    return true;
}

/**
 * Checks if a three card set is valid
 * @param set the set to check
 * @throws if the set is invalid
 */
export function checkThreeCardSet(set: ThreeCardSet) {
    return check(set);
}

/**
 * A class representing a three (or more) of a kind
 */
export class ThreeCardSet extends Run {
    /**
     * The wilds of this set
     */
    public wilds: Card[];

    /**
     * The rank of the three of a kind
     */
    public rank: Rank;

    /**
     * Marker to designate this set as being a three of a kind
     */
    public type = 3;

    /**
     * Creates a ThreeCardSet
     * @param cards the cards to use
     * @throws if the set is not valid
     */
    constructor(cards: Card[]) {
        super();
        if (!cards) {
            throw new InvalidError('No cards entered');
        }
        this.cards = cards.sort(Card.compare);
        this.wilds = this.cards.filter((card) => card.isWild());
        const nonWild: Card | undefined = this.cards.find((card) => !card.isWild());
        if (!nonWild) { throw new InvalidError('No non-wilds'); }
        this.rank = nonWild.rank;
        this.check();
    }

    /**
     * Checks if a card could be played in this set
     * @param card the card to check against this set
     */
    public isLive(card: Card) {
        if (card.isWild()) {
            return 2 * this.wilds.length < this.cards.length;
        }
        return card.rank === this.rank;
    }

    /**
     * Returns the cards that could be played in this set
     * @returns the array of live cards
     */
    public liveCards(): Card[] {
        let live: Card[] = [];
        if (2 * this.wilds.length <= this.cards.length) {
            live = potentialWilds;
        }
        Suit.suits.forEach((suit: Suit) => live.push(new Card(suit, this.rank)));
        return live;
    }

    /**
     * Adds all of the cards provided to the set
     * @param cards the cards to add
     */
    public add(...cards: Card[]) {
        for (const card of cards) {
            if (!this.isLive(card)) {
                throw new ValueError('Not a valid card');
            }
            if (card.isWild()) {
                this.wilds.push(card);
                this.wilds.sort(Card.compare);
            }
            this.cards.push(card);
            this.cards.sort(Card.compare);
        }
    }

    /**
     * Creates a new three card set using the same underlying card objects
     * @returns the clone
     */
    public clone(): ThreeCardSet {
        return new ThreeCardSet([...this.cards]);
    }

    /**
     * Creates a string representation of this set
     * @returns the string representation
     */
    public toString(): string {
        return 'Set of ' + this.rank.toString() + ' <' + this.cards.map((card) => card.toString()).join(' ') + '>';
    }

    /**
     * Checks if this three card set is valid
     * @throws if the set is invalid
     */
    private check() {
        return check(this);
    }
}
