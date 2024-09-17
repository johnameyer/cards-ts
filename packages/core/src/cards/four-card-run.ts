import { zip } from '../util/zip.js';
import { InvalidError } from './invalid-error.js';
import { Rank } from './rank.js';
import { Card, potentialWilds } from './card.js';
import { Meld } from './meld.js';
import { Suit } from './suit.js';

const bifilter = function<T>(array: Array<T>, filter: (item: T) => any): [T[], T[]] {
    return array.reduce(([ match, nonMatch ], item) => {
        if(filter(item)) {
            match.push(item);
        } else {
            nonMatch.push(item);
        }
        return [ match, nonMatch ];
    }, [[], []] as [T[], T[]]);
};

/**
 * Checks if a given run is valid
 * @param run the run to check if valid
 * @throws an error if invalid
 */
function check(run: FourCardRun): void {
    if(run.cards.length - run.numWilds < run.numWilds) {
        throw new InvalidError('Too many wild cards ' + run.cards.toString());
    }
    if(run.cards.length < 4) {
        throw new InvalidError('Not enough cards ' + run.cards.toString());
    }

    if(run.cards.findIndex(val => !val) >= 0) {
        throw new InvalidError('Falsy value ' + run.cards.toString());
    }

    const [ first, last ]: [Rank, Rank] = run.range();
    if(first.order > last.order) {
        throw new InvalidError('Cards should be from lowest to highest');
    }
    if(!first || first.order < Rank.THREE.order || !last) {
        throw new InvalidError('Too many wilds on one side ' + run.cards.toString());
    }
    for(let i = 0; i < last.order - first.order; i++) {
        const selected: Card = run.cards[i];
        if(selected.isWild()) {
            continue;
        }
        if(selected.rank === first.displace(i) && selected.suit === run.suit) {
            continue;
        }
        throw new InvalidError('Card is invalid suit or not ordered ' + run.cards.toString());
    }
}

/**
 * Checks whether it is possible to construct a four card run with the given cards
 * @param cards the cards to consider
 * @returns whether a four card run is possible
 */
export function checkFourCardRunPossible(cards: readonly Card[]) {
    const sorted = [ ...cards ].sort(Card.compare);
    const [ wilds, nonwilds ] = bifilter(sorted, card => card.isWild());
    for(let i = 0; i < nonwilds.length - 1; i++) {
        if(nonwilds[i].rank === nonwilds[i + 1].rank && nonwilds[i].suit === nonwilds[i + 1].suit) {
            throw new InvalidError('Non wild card is repeated');
        }
    }
    if(nonwilds.length < wilds.length) {
        throw new InvalidError('Too many wild cards');
    }
    if(cards.length < 4) {
        throw new InvalidError('Not enough cards');
    }
    const suit = nonwilds[0].suit;
    const [ first, last ]: [Rank, Rank] = [ nonwilds[0].rank, nonwilds[nonwilds.length - 1].rank ];
    for(let i = 0; i < nonwilds.length; i++) {
        const selected: Card = nonwilds[i];
        if(selected.suit !== suit) {
            throw new InvalidError('Card is invalid suit');
        }
        if(selected.rank === first.displace(i)) {
            continue;
        }
        const difference = selected.rank.difference(nonwilds[i].rank) - 1;
        if(wilds.length > difference) {
            wilds.splice(0, difference);
            continue;
        }
        throw new InvalidError('Not enough wilds');
    }

}

/**
 * Checks if a given run is valid
 * @param run the run to check if valid
 * @throws an error if invalid
 */
export function checkFourCardRun(run: FourCardRun) {
    return check(run);
}

/**
 * A class representing a run (or straight flush) of at least four cards being in sequential order and of the same suit, potentially containing wilds
 */
export class FourCardRun extends Meld {
    public readonly type = 'straight';

    /**
     * The number of wilds contained
     */
    public numWilds: number;

    /**
     * The suit that this four card run consists of
     */
    public suit: Suit;

    /**
     * Number to distinguish runs of this type from a three card set
     */
    public runType = 4;

    /**
     * Create a four card run from the given cards
     * @param cards the cards to create using
     * @throws an error if the run would not be valid
     */
    constructor(public cards: Card[]) {
        super();
        this.numWilds = cards.filter((card) => card.isWild()).length;
        const firstNonWild = this.cards.find((card) => !card.isWild());
        if(!firstNonWild) {
            throw new InvalidError('Entirely wildcards');
        }
        this.suit = firstNonWild.suit as Suit;

        this.check();
    }

    /**
     * Creates a duplicate of this run using the same underlying card objects
     * @returns the duplicate
     */
    public clone(): FourCardRun {
        return new FourCardRun([ ...this.cards ]);
    }

    /**
     * Returns the ranks that this run encompasses, even if the role is filled by a wild card
     * @returns the ranks this encompasses
     * @example FourCardRun(3S, 4S, 5S, 2S).range()
     * > [3, 6]
     */
    public range(): [Rank, Rank] {
        const firstNonWild: number = this.cards.findIndex((card) => !card.isWild());
        const first = this.cards[firstNonWild].rank.displace(-firstNonWild);
        const reversed: Card[] = this.cards.slice().reverse();
        const lastNonWild: number = reversed.findIndex((card) => !card.isWild());
        const last = reversed[lastNonWild].rank.displace(lastNonWild);
        return [ first, last ];
    }

    /**
     * Finds open spots that could be filled in by a non-wild card
     * @yields the available ranks
     * @example [...FourCardRun(3S, 4S, 2S, 6S).findSpots()]
     * > [5, 7]
     */
    public * findSpots(): Iterable<Rank> {
        for(const rank of Rank.ranks) {
            if(this.findSpotFor(rank) >= 0) {
                yield rank;
            }
        }
    }

    /**
     * Returns where in the array the card should go, or else -1
     * @param cardOrRank the card or rank to be considered
     * @returns where in the array such a card ought to go
     */
    public findSpotFor(cardOrRank: Card | Rank): number {
        // note that when inserting, wilds ought to be pushed or shifted, and cards to be spliced
        let rank: Rank;
        if(cardOrRank instanceof Card) {
            rank = (cardOrRank as Card).rank;
        } else {
            rank = cardOrRank as Rank;
        }

        if(rank.isWild()) {
            const range: [Rank, Rank] = this.range();
            if(this.cards.length - this.numWilds > this.numWilds && (range[0] !== Rank.THREE || range[1] !== Rank.ACE)) {
                return 0;
            } 
            return -1;
            
        } 
        const range: [Rank, Rank] = this.range();
        const firstRank: Rank = range[0];
        const lastRank: Rank = range[1];
        if(firstRank !== Rank.THREE && firstRank.order - rank.order === 1) {
            return 0;
        }
        let i;
        for(i = 0; i <= range[1].order - range[0].order; i++) {
            if(!this.cards[i].isWild()) {
                continue; 
            }
            const thisRank: Rank = range[0].displace(i);
            if(thisRank.order === rank.order) {
                return i;
            }
        }
        if(lastRank !== Rank.ACE && rank.order - lastRank.order === 1) {
            return i;
        }
        
        return -1;
    }

    /**
     * Adds a card to this run
     * @param card the card to add
     * @param moveWildTop whether (if applicable) to move a wild at that position to the top or to the bottom
     */
    public add(card: Card, moveWildTop = true): void {
        const index = this.findSpotFor(card);
        const [ first, last ]: [Rank, Rank] = this.range();
        if(index === -1) {
            throw new InvalidError('Invalid card');
        }
        if(card.isWild()) {
            if(moveWildTop) {
                if(last !== Rank.ACE) {
                    this.cards.push(card);
                } else if(first !== Rank.THREE) {
                    this.cards.unshift(card);
                } else {
                    throw new InvalidError('There is no room in this run for any more cards');
                }
            } else {
                if(first !== Rank.THREE) {
                    this.cards.unshift(card);
                } else if(last !== Rank.ACE) {
                    this.cards.push(card);
                } else {
                    throw new InvalidError('There is no room in this run for any more cards');
                }
            }
            this.numWilds++;
        } else if(card.suit !== this.suit) {
            throw new InvalidError('Wrong suit');
        } else if(first.order - card.rank.order === 1) {
            this.cards.unshift(card);
        } else if(card.rank.order - last.order === 1) {
            this.cards.push(card);
        } else {
            const [ wild ]: Card[] = this.cards.splice(index, 1, card);
            if(moveWildTop) {
                if(last !== Rank.ACE) {
                    this.cards.push(wild);
                } else if(first !== Rank.THREE) {
                    this.cards.unshift(wild);
                } else {
                    throw new InvalidError('There is no room in this run for any more cards');
                }
            } else {
                if(first !== Rank.THREE) {
                    this.cards.unshift(wild);
                } else if(last !== Rank.ACE) {
                    this.cards.push(wild);
                } else {
                    throw new InvalidError('There is no room in this run for any more cards');
                    // TODO consider setting to allow moving the wild in this case
                }
            }
        }
    }

    /**
     * Tells whether or not a card would fit in this run
     * @param card the card to check
     * @returns whether the card would fit in this run
     */
    public isLive(card: Card): boolean {
        if(card.isWild()) {
            return this.cards.length - this.numWilds > this.numWilds;
        }
        return this.findSpotFor(card) !== -1 && this.suit === card.suit;
    }

    /**
     * Returns all the cards that could be played in this set
     * @returns an array of the live cards
     */
    public liveCards(): Card[] {
        let live: Card[] = [];
        if(this.cards.length - this.numWilds > this.numWilds) {
            live = potentialWilds.slice();
        }
        for(const rank of this.findSpots()) {
            live.push(new Card(this.suit, rank));
        }
        return live;
    }

    /**
     * Returns a textual representation
     * @returns string form
     */
    public toString(): string {
        return 'Run of ' + this.suit.toString() + ' <' + this.cards.map((card) => card.toString()).join(', ') + '>';
    }

    public equals(other?: any): boolean {
        if(!other) {
            return false;
        }
        if(!(other instanceof FourCardRun)) {
            return false;
        }
        if(this.suit !== other.suit) {
            return false;
        }
        if(this.cards.length !== other.cards.length) {
            return false;
        }
        const whereInequal = ([ first, second ]: [Card, Card]) => !first.equals(second);
        if(zip(this.cards.slice().sort(Card.compare), other.cards.slice().sort(Card.compare)).findIndex(whereInequal) >= 0) {
            return false;
        }
        return true;
    }

    /**
     * Runs the check method on this
     */
    private check() {
        return check(this);
    }

    public static fromObj(obj: any) {
        return new FourCardRun(obj.cards.map((card: any) => Card.fromObj(card)));
    }
}
