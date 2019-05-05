import { Card } from './card';
import { Rank } from './rank';
import { Suit } from './suit';

function choiceAndRemove<T>(items: T[]): T {
    return items.splice(Math.floor(Math.random() * items.length), 1)[0];
}

function shuffle<T>(items: T[]): T[] {
    return items.sort(() => 0.5 - Math.random());
}

function flatMap(arr: any[], func: (a: any) => (any)) {
    arr.reduce((acc, x) => acc.concat(func(x)), []);
}

// TODO make deck keep discard and reverse automatically when empty

export default class Deck {
    public cards: Card[];
    private discards: Card[] = [];
    private topAvailable = false;

    constructor(num: number = -1, shouldShuffle: boolean = true) {
        if (num + 1) { // note that even a number of 0 would be acceptable here
            this.cards = [];
            for (let deck = 0; deck < num; deck ++) {
                for (const suit of Suit.suits) {
                    for (const rank of Rank.ranks) {
                        if (rank !== Rank.JOKER) {
                            this.cards.push(new Card(suit, rank, deck));
                        }
                    }
                }
                this.cards.push(new Card(Suit.NONE, Rank.JOKER, deck, 0));
                this.cards.push(new Card(Suit.NONE, Rank.JOKER, deck, 1));
            }
        } else {
            // WHAT?
            throw new Error();
        }
        if (shouldShuffle) {
            shuffle(this.cards);
        }
    }

    get top(): Card | null {
        if (!this.topAvailable) {
            return null;
        }
        return this.discards[this.discards.length - 1];
    }

    /**
     * Shuffles the cards of this deck
     */
    public shuffle() {
        shuffle(this.cards);
    }

    /**
     * Selects a card and removes it
     */
    public draw() {
        if (this.cards.length === 0) {
            this.cards = this.discards;
            this.shuffle();
        }
        return choiceAndRemove(this.cards);
    }

    public discard(card: Card) {
        this.topAvailable = true;
        this.discards.push(card);
    }

    public toString() {
        return 'Deck with ' + this.cards.length + ' cards left';
    }

    public takeTop() {
        this.discards.pop();
        this.topAvailable = false;
    }
}
