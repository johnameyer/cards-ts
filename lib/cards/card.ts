import { Rank } from './rank';
import { Suit } from './suit';
import { ValueError } from './value-error';

export class Card {

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

    public static compare(one: Card, two: Card): number {
        if (one.rank !== two.rank) {
            return Rank.compare(one.rank, two.rank);
        }
        return Suit.compare(one.suit, two.suit);
    }

    constructor(public readonly suit: Suit,
                public readonly rank: Rank,
                public readonly deck: number = -1,
                private readonly jokerNum: number = -1,
                ) {
    }

    public toString() {
        if (this.rank === Rank.JOKER) {
            return '* (Joker)';
        }
        return this.rank.toString() + ' of ' + this.suit.toString();
    }

    public isWild(): boolean {
        return this.rank.isWild();
    }

    public equals(other?: Card): boolean {
        if (!other) {
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

export const potentialWilds =  ['*', '2C', '2S', '2H', '2D'].map(Card.fromString);
