import { Card, potentialWilds } from './card';
import { InvalidError } from './invalid-error';
import { Rank } from './rank';
import Run from './run';
import { Suit } from './suit';

export class FourCardRun extends Run {
    public numWilds: number;
    public suit: Suit;

    /*get cards(): Card[] {
        return this.cards;
    }*/

    constructor(public cards: Card[]) {
        super();
        this.numWilds = cards.filter((card) => card.isWild()).length;
        const firstNonWild = this.cards.find((card) => !card.isWild());
        if (!firstNonWild) {
            throw new InvalidError('Entirely wildcards');
        }
        this.suit = firstNonWild.suit as Suit;

        this.check();
    }
    public clone(): Run {
        return new FourCardRun(this.cards);
    }

    public range(): [Rank, Rank] {
        const firstNonWild: number = this.cards.findIndex((card) => !card.isWild());
        const first = this.cards[firstNonWild].rank.displace(-firstNonWild);
        const reversed: Card[] = this.cards.slice().reverse();
        const lastNonWild: number = reversed.findIndex((card) => !card.isWild());
        const last = reversed[lastNonWild].rank.displace(lastNonWild);
        return [first, last];
    }

    public * findSpots(): Iterable<Rank> {
        for (const rank of Rank.ranks) {
            if (this.findSpotFor(rank) >= 0) {
                yield rank;
            }
        }
    }

    /**
     * Returns where in the array the card should go, or else -1.
     * Note that wilds ought to be pushed or shifted, and cards to be spliced
     * @param cardOrRank
     */
    public findSpotFor(cardOrRank: Card | Rank): number {
        let rank: Rank;
        if (cardOrRank instanceof Card) {
            rank = (cardOrRank as Card).rank;
        } else {
            rank = cardOrRank as Rank;
        }

        if (rank.isWild()) {
            if (this.cards.length - this.numWilds > this.numWilds) {
                return 0;
            } else {
                return -1;
            }
        } else {
            const range: [Rank, Rank] = this.range();
            const firstRank: Rank = range[0];
            const lastRank: Rank = range[1];
            if (firstRank !== Rank.THREE && firstRank.order - rank.order === 1) {
                return 0;
            }
            let i;
            for (i = 0; i <= range[1].order - range[0].order; i++) {
                if (!this.cards[i].isWild()) { continue; }
                const thisRank: Rank = range[0].displace(i);
                if (thisRank.order === rank.order) {
                    return i;
                }
            }
            if (lastRank !== Rank.ACE && rank.order - lastRank.order === 1) {
                return i;
            }
        }
        return -1;
    }

    public add(card: Card, moveWildTop: boolean = true): void {
        const index = this.findSpotFor(card);
        const [first, last]: [Rank, Rank] = this.range();
        if (index === -1) {
            throw new InvalidError('Invalid card');
        }
        if (card.isWild()) {
            if (moveWildTop) {
                if (last !== Rank.ACE) {
                    this.cards.push(card);
                } else if (first !== Rank.THREE) {
                    this.cards.unshift(card);
                } else {
                    throw new Error('');
                }
            } else {
                if (first !== Rank.THREE) {
                    this.cards.unshift(card);
                } else if (last !== Rank.ACE) {
                    this.cards.push(card);
                } else {
                    throw new InvalidError('x');
                }
            }
            this.numWilds++;
        } else if (card.rank.value < first.value) {
            this.cards.unshift(card);
        } else if (card.rank.value - last.value === 1) {
            this.cards.push(card);
        } else {
            const [wild]: Card[] = this.cards.splice(index, 1, card);
            if (moveWildTop) {
                if (last !== Rank.ACE) {
                    this.cards.push(wild);
                } else if (first !== Rank.THREE) {
                    this.cards.unshift(wild);
                } else {
                    throw new InvalidError('AAAHHH');
                }
            } else {
                if (first !== Rank.THREE) {
                    this.cards.unshift(wild);
                } else if (last !== Rank.ACE) {
                    this.cards.push(wild);
                } else {
                    throw new InvalidError('AAAAHHH2');
                }
            }
        }
    }

    public isLive(card: Card): boolean {
        if (card.isWild()) {
            return this.cards.length - this.numWilds > this.numWilds;
        }
        return this.findSpotFor(card) !== -1 && this.suit === card.suit;
    }

    public liveCards(): Card[] {
        let live: Card[] = [];
        if (this.cards.length - this.numWilds > this.numWilds) {
            live = potentialWilds;
        }
        for (const rank of this.findSpots()) {
            live.push(new Card(this.suit, rank));
        }
        return live;
    }

    private check(): boolean {
        if (this.cards.length - this.numWilds < this.numWilds) {
            throw new InvalidError('Too many wild cards');
        }
        if (this.cards.length < 4 ) {
            throw new InvalidError('Not enough cards');
        }

        const [first, last]: [Rank, Rank] = this.range();
        if (!first || first.order < Rank.THREE.order || !last) {
            throw new InvalidError('Too many wilds on one side');
        }
        for (let i = 0; i < last.order - first.order; i++) {
            const selected: Card = this.cards[i];
            if (selected.isWild()) {
                continue;
            }
            if (selected.rank === first.displace(i) && selected.suit === this.suit) {
                continue;
            }
            throw new InvalidError('Card is invalid suit or not ordered');
        }
        return true;
    }
}
