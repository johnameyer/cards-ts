import { Card } from './card';
import { Suit } from './suit';
import { Rank } from './rank';
import { InvalidError } from './invalid-error';

function choiceAndRemove<T>(items: T[]): T {
    return items.splice(Math.floor(Math.random() * items.length), 1)[0];
}

function shuffle<T>(items: T[]): T[] {
    return items.sort(() => 0.5 - Math.random());
}

/**
 * Class representing N standard 54 card decks' draw and discard pile, tracking the top card
 */
export class Deck {
    public readonly type = 'deck';

    /**
     * The cards still in the deck
     * @todo make private without breaking tests
     */
    public cards: Card[];

    /**
     * The cards that have been discarded
     */
    public discards: Card[] = [];

    /**
     * Whether or not the top card can still be picked up
     */
    private topAvailable = false;

    /**
     * Create a new deck
     * @param num the number of decks to include (0 or more)
     * @param shouldShuffle whether the deck should be shuffled automatically
     * @returns the new deck
     */
    constructor(num = 0, shouldShuffle = true, includeJokers = true, ranks = Rank.ranks) {
        if (num >= 0) {
            this.cards = [];
            for (let deck = 0; deck < num; deck ++) {
                for (const suit of Suit.suits) {
                    for (const rank of ranks) {
                        if (rank !== Rank.JOKER) {
                            this.cards.push(new Card(suit, rank, deck));
                        }
                    }
                }
                if(includeJokers && Rank.ranks.indexOf(Rank.JOKER) >= 0) {
                    // TODO revisit
                    this.cards.push(new Card(Suit.NONE, Rank.JOKER, deck, 0));
                    this.cards.push(new Card(Suit.NONE, Rank.JOKER, deck, 1));
                }
            }
        } else {
            throw new InvalidError('Must have a non-negative number of cards');
        }
        if (shouldShuffle) {
            shuffle(this.cards);
        }
    }

    /**
     * Get the top card of the discards, if available
     * @returns the top card, or null available
     */
    get top(): Card | null {
        if (!this.topAvailable || this.discards.length === 0) {
            return null;
        }
        return this.discards[this.discards.length - 1];
    }

    /**
     * Shuffles the cards of this deck
     * @returns whether there are still cards in the deck
     */
    public shuffle() {
        if(this.cards) {
            shuffle(this.cards);
            return true;
        }
        return false;
    }

    /**
     * Take the first card and flip it over
     * @returns the flipped/top card
     * @throws an error if there is no card to flip
     */
    public flip(): Card {
        const card = this.draw();
        if (card === undefined) {
            throw new Error('No cards to flip');
        }
        this.discard(card);
        return card;
    }

    /**
     * Selects a card and removes it
     * @returns the card
     */
    public draw() {
        return choiceAndRemove(this.cards);
    }

    /**
     * Shuffle the discards back into the deck
     * @returns whether there are still cards in the deck
     */
    public shuffleDiscard() {
        this.cards.push(...this.discards);
        return this.shuffle();
    }

    /**
     * Add a card to the discard pile and mark as available for pickup
     * @param card the card being discarded
     */
    public discard(card: Card) {
        this.topAvailable = true;
        this.discards.push(card);
    }

    /**
     * Convert to basic readable form
     * @returns string representation
     */
    public toString() {
        return 'Deck with ' + this.cards.length + ' cards left';
    }

    /**
     * Pop the top card of the discards and mark as no longer available
     */
    public takeTop() {
        this.discards.pop();
        this.clearTop();
    }

    /**
     * Mark the top card as no longer available
     */
    public clearTop() {
        this.topAvailable = false;
    }

    public static fromObj(obj: any) {
        if(!(obj instanceof Object)) {
            throw new Error('Object is falsy');
        }
        if(!Array.isArray(obj.cards) || !Array.isArray(obj.discards)) {
            throw new Error('Shape of object is wrong');
        }
        const deck = new Deck();
        deck.cards = obj.cards.map((card: unknown) => Card.fromObj(card));
        deck.discards = obj.discards.map((card: unknown) => Card.fromObj(card));
        deck.topAvailable = obj.topAvailable;

        return deck;
    }
}