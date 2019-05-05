import { Card, potentialWilds } from './card';
import { InvalidError } from './invalid-error';
import { Rank } from './rank';
import Run from './run';
import { Suit } from './suit';
import { ValueError } from './value-error';

export default class ThreeCardSet extends Run {
    public cards: Card[];
    public wilds: Card[];
    public rank: Rank;

    constructor(cards: Card[]) {
        super();
        this.cards = cards.sort(Card.compare);
        this.wilds = this.cards.filter((card) => card.isWild());
        const nonWild: Card | undefined = this.cards.find((card) => !card.isWild());
        if (!nonWild) { throw new InvalidError('No non-wilds'); }
        this.rank = nonWild.rank;
        this.check();
    }

    public isLive(card: Card) {
        if (card.isWild()) {
            return 2 * this.wilds.length < this.cards.length;
        }
        return card.rank === this.rank;
    }

    public liveCards(): Card[] {
        let live: Card[] = [];
        if (2 * this.wilds.length <= this.cards.length) {
            live = potentialWilds;
        }
        Suit.suits.forEach((suit: Suit) => live.push(new Card(suit, this.rank)));
        return live;
    }

    public add(card: Card) {
        if (this.isLive(card)) {
            if (card.isWild()) {
                this.wilds.push(card);
                this.wilds.sort(Card.compare);
            }
            this.cards.push(card);
            this.cards.sort(Card.compare);
            return;
        }
        throw new ValueError('Not a valid card');
    }

    public clone(): Run {
        return new ThreeCardSet(this.cards);
    }

    private check() {

        if (this.cards.length < 2 * this.wilds.length) { // 2 < count {
            throw new InvalidError('Too many wilds');
        }
        if (this.cards.length < 3) {
            throw new InvalidError('Not enough cards');
        }

        for (const card of this.cards) {
            if (card.isWild()) {
                continue;
            }
            if (card.rank !== this.rank) {
                throw new InvalidError('Card not of the right suit');
            }
        }
        return true;
    }
}
