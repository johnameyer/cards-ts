import { InvalidError } from "./invalid-error";
import { Run } from "./run";
import { Card, potentialWilds } from "./card";
import { Rank } from "./rank";
import { Suit } from "./suit";
import { ValueError } from "./value-error";

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
            throw new InvalidError('Card not of the right suit');
        }
    }
    return true;
}

export function checkThreeCardSet(set: ThreeCardSet) {
    return check(set);
}

export class ThreeCardSet extends Run {
    public cards: Card[];
    public wilds: Card[];
    public rank: Rank;
    public type = 3;

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

    public clone(): ThreeCardSet {
        return new ThreeCardSet([...this.cards]);
    }

    public toString(): string {
        return 'Set of ' + this.rank.toString() + ' <' + this.cards.map((card) => card.toString()).join(' ') + '>';
    }

    private check() {
        return check(this);
    }
}
