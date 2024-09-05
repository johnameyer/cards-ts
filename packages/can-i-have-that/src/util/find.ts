import { bifilter } from './bifilter.js';
import { Card } from '@cards-ts/core';
import { Rank } from '@cards-ts/core';

/**
 * Function that tries to find an optimal utilization of the current cards to achieve the goals of the round
 * @param cards the cards to search over
 * @param sought the type of runs that are being sought after
 * @see findOptimimum for details
 */
export function find(cards: Card[], sought: (3 | 4)[]) {
    const [ wilds, nonWilds ] = bifilter(cards, card => card.isWild());
    nonWilds.sort(Card.compare);
    wilds.sort(Card.compare);
    /*
     * if(sought.indexOf(3) === -1 || sought.indexOf(4) === -1){
     *     return findHomogeneous(nonWilds, wilds, sought as 3[] | 4[]);
     * }
     */
    const result = findOptimimum(nonWilds, 0, wilds, sought, sought.map(() => []));

    for(let index = 0; index < sought.length; index++) {
        if(sought[index] === 4 && result[2][index].length > 0) {
            const sorted: Card[] = [];
            const [ wilds, nonWilds ] = bifilter(result[2][index], card => card.isWild());
            let previous = nonWilds.shift() as Card;
            const first = previous;
            sorted.push(previous);
            while(nonWilds.length > 0) {
                const current = nonWilds.shift() as Card;
                const distance = Math.min(current.rank.distance(previous.rank) - 1, wilds.length);
                sorted.push(...wilds.splice(0, distance));
                sorted.push(current);
                previous = current;
            }
            {
                const distance = Math.min(Math.max(1, previous.rank.distance(Rank.ACE)) - 1, wilds.length);
                sorted.push(...wilds.splice(0, distance));
            }
            {
                const distance = Math.min(Math.max(1, first.rank.distance(Rank.THREE)) - 1, wilds.length);
                sorted.unshift(...wilds.splice(0, distance));
            }
            result[2][index] = sorted;
        }
    }

    return result;
}

// The reduction compares all the options
const reduction = <T extends {0: number, 1: number}>(a: T, b: T): T => {
    if(a[0] > b[0]) {
        return b;
    } else if(a[0] === b[0]) {
        if(a[1] > b[1]) {
            return b;
        } 
        return a;
        
    } 
    return a;
    
};

/**
 * Find the optimal runs on a part of the subtree described by cardIndex, wildsIndex, and runs
 * Optimal is defined as firstly getting as close as possible to achieving the round goals, secondly by utilizing as many cards as possible
 * @param cards the non-wild cards to search over
 * @param cardIndex the current index in the non-wilds array
 * @param wilds the wilds to search over
 * @param sought the runs being sought after
 * @param runs the runs that have been recursively constructed
 * @returns a tuple containing the number of cards needed, the number of points left over, the runs constructed, and the unused cards
 */
function findOptimimum(cards: Card[], cardIndex: number, wilds: Card[], sought: (3 | 4)[], runs: Card[][]): [missing: number, unusedPoints: number, runs: Card[][], unusedCards: Card[]] {
    // console.log(runs.toString());

    /*
     * console.log(runs.map(run => run.map(card => card.toString())));
     * return [Infinity, Infinity, sought.map(() => []), []];
     */
    if(cardIndex >= cards.length) {
        for(let index = 0; index < runs.length; index++) {
            if(sought[index] === 4) {
                const number = runs[index].length;
                const span = runs[index].length > 0 ? runs[index][0].rank.difference(runs[index][runs[index].length - 1].rank) + 1 : 0;
                if(span > 2 * number) {
                    return [ Infinity, Infinity, sought.map(() => []), []];
                }
            }
        }
        // If we have reached the leaf nodes (e.g. have chosen a spot for every card)
        return findOptimimumWilds(wilds, 0, sought, runs.slice());
    }
    let noChoose: [number, number, Card[][], Card[]];
    {
        const recurse = findOptimimum(cards, cardIndex + 1, wilds, sought, runs);
        const unused = [ ...recurse[3], cards[cardIndex] ];
        noChoose = [ recurse[0], recurse[1] + cards[cardIndex].rank.value, recurse[2], unused ];
    }
    const choices: [number, number, Card[][], Card[]][] = sought.map((_, index) => index).filter(index => {
        // Can we add a card to this meld?
        if(runs[index].length > 0) {
            // If we have already added a card to this meld
            if(sought[index] === 4) {
                // And this meld is to be a four card run
                if(runs[index][0].suit !== cards[cardIndex].suit || runs[index][runs[index].length - 1].rank === cards[cardIndex].rank) {
                    // We can't add on if it's the wrong suit or if we already added a card of that rank (since the cards are processed in rank order)
                    return false;
                }
            } else {
                // If it's to be a three card set
                if(runs[index][0].rank !== cards[cardIndex].rank) {
                    // It must be of the same suit
                    return false;
                }
            }
        } else {
            // If there's not already cards in this meld
            if(sought[index] === 4) {
                // And it is meant to be a four card run
                for(let x = 0; x < sought.length; x++) {
                    if(x === index || sought[x] !== 4 || runs[x].length === 0) {
                        continue;
                    }
                    if(runs[x][0].suit === cards[cardIndex].suit) {
                        // There cannot be any other four card runs of this suit
                        return false;
                    }
                }
            } else {
                // If it is meant to be a three card set
                for(let x = 0; x < sought.length; x++) {
                    if(x === index || sought[x] !== 3 || runs[x].length === 0) {
                        continue;
                    }
                    if(runs[x][0].rank === cards[cardIndex].rank) {
                        // There cannot be a three card set of this rank
                        return false;
                    }
                }
            }
        }
        return true;
    })
        .map(index => {
            const created = [ ...runs[index], cards[cardIndex] ];
            const newRuns = runs.slice();
            newRuns.splice(index, 1, created);
            return findOptimimum(cards, cardIndex + 1, wilds, sought, newRuns);
        });
    choices.push(noChoose);
    // Return the best of the choices
    return choices.reduce(reduction);
}

/*
 * function findHomogeneous(nonWilds: Card[], wilds: Card[], sought: 3[] | 4[]) {
 *     if(sought[0] === 3) {
 *         const availableRanks = nonWilds.reduce<{[rank: number]: Card[]}>((reduction, card) => {
 *             const ofSuit = reduction[card.rank.order] || [];
 *             ofSuit.push(card);
 *             reduction[card.rank.order] = ofSuit;
 *             return reduction;
 *         }, {});
 *     } else {
 *         const availableSuits = nonWilds.reduce<{[rank: number]: Card[]}>((reduction, card) => {
 *             const ofSuit = reduction[card.rank.order] || [];
 *             ofSuit.push(card);
 *             reduction[card.rank.order] = ofSuit;
 *             return reduction;
 *         }, {});
 *     }
 * }
 */

function findOptimimumWilds(wilds: Card[], wildIndex: number, sought: (3 | 4)[], runs: Card[][]): [missing: number, unusedPoints: number, runs: Card[][], unusedCards: Card[]] {
    if(wildIndex >= wilds.length) {
        // This is the number of cards to make this whole
        let missing = 0;

        // Identify the runs that are missing cards
        for(let index = 0; index < runs.length; index++) {
            if(runs[index].length === 0) {
                missing += sought[index];
            } else if(sought[index] === 3) {
                missing += Math.max(3 - runs[index].length, 0);
            } else {
                const number = runs[index].length;
                const nonWilds = runs[index].filter(card => !card.isWild());
                const span = nonWilds.length > 0 ? nonWilds[0].rank.difference(nonWilds[nonWilds.length - 1].rank) + 1 : 0;

                missing += Math.max(Math.max(span, 4) - number, 0);
            }
        }
        return [ missing, 0, runs, []];
    }

    const options = [ ...Array(runs.length).keys() ].filter(index => {
        const [ wilds, nonWilds ] = bifilter(runs[index], card => card.isWild());
        return nonWilds.length > wilds.length;
    }).map(index => {
        const created = [ ...runs[index], wilds[wildIndex] ];
        const newRuns = runs.slice();
        newRuns.splice(index, 1, created);
        return findOptimimumWilds(wilds, wildIndex + 1, sought, newRuns);
    });

    let noChoose: [number, number, Card[][], Card[]];
    {
        const recurse = findOptimimumWilds(wilds, wilds.length, sought, runs.slice());
        const unused = wilds.slice(wildIndex);
        noChoose = [ recurse[0], unused.map(unused => unused.rank.value).reduce((a, b) => a + b, 0), recurse[2], unused ];
    }
    options.push(noChoose);

    return options.reduce(reduction);
}
