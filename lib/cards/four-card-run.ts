import { InvalidError } from "./invalid-error";
import { Rank } from "./rank";
import { Card, potentialWilds } from "./card";
import { Run } from "./run";
import { Suit } from "./suit";

declare global {
    interface Array<T> {
        bifilter(filter: (item: T) => any): [T[], T[]];
    }
}

Array.prototype.bifilter = function<T>(filter: (item: T) => any): [T[], T[]] {
    return this.reduce(([match, nonMatch], item) => {
        if (filter(item)) {
            match.push(item);
        } else {
            nonMatch.push(item);
        }
        return [match, nonMatch];
    }, [[],[]]);
}

/**
* Checks if a given run is valid
* @param run the run to check if valid
*/
function check(run: FourCardRun): void {
    if (run.cards.length - run.numWilds < run.numWilds) {
        throw new InvalidError('Too many wild cards');
    }
    if (run.cards.length < 4 ) {
        throw new InvalidError('Not enough cards');
    }
    
    const [first, last]: [Rank, Rank] = run.range();
    if (!first || first.order < Rank.THREE.order || !last) {
        throw new InvalidError('Too many wilds on one side');
    }
    for (let i = 0; i < last.order - first.order; i++) {
        const selected: Card = run.cards[i];
        if (selected.isWild()) {
            continue;
        }
        if (selected.rank === first.displace(i) && selected.suit === run.suit) {
            continue;
        }
        throw new InvalidError('Card is invalid suit or not ordered');
    }
}

export function checkFourCardRunPossible(cards: readonly Card[]) {
    let sorted = [...cards].sort(Card.compare);
    let [wilds, nonwilds] = sorted.bifilter(card => card.isWild());
    for(let i = 0; i < nonwilds.length - 1; i++) {
        if(nonwilds[i].rank == nonwilds[i+1].rank && nonwilds[i].suit == nonwilds[i+1].suit) {
            throw new InvalidError('Non wild card is repeated');
        }
    }
    if (nonwilds.length < wilds.length) {
        throw new InvalidError('Too many wild cards');
    }
    if (cards.length < 4 ) {
        throw new InvalidError('Not enough cards');
    }
    const suit = nonwilds[0].suit;
    const [first, last]: [Rank, Rank] = [nonwilds[0].rank, nonwilds[nonwilds.length - 1].rank];
    for (let i = 0; i < nonwilds.length; i++) {
        const selected: Card = nonwilds[i];
        if(selected.suit !== suit) {
            throw new InvalidError('Card is invalid suit');
        }
        if (selected.rank === first.displace(i)) {
            continue;
        }
        let difference = selected.rank.difference(nonwilds[i].rank) - 1; 
        if(wilds.length > difference) {
            wilds.splice(0, difference);
            continue;
        }
        throw new InvalidError('Not enough wilds');
    }
    
}

export function checkFourCardRun(run: FourCardRun) {
    return check(run);
}

export class FourCardRun extends Run {
    public numWilds: number;
    public suit: Suit;
    public type = 4;
    
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
    
    public clone(): FourCardRun {
        return new FourCardRun([...this.cards]);
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
    
    public toString(): string {
        return 'Run of ' + this.suit.toString() + ' <' + this.cards.map((card) => card.toString()).join(' ') + '>';
    }
    
    private check() {
        return check(this);
    }
}
