import { Card } from './card';

declare global {
    interface Array<T> {
        bifilter(filter: (item: T) => any): [T[], T[]];
        toString(): string;
    }
}

Array.prototype.bifilter = function<T>(filter: (item: T) => any) {
    if(!filter) {
        return [this, []];
    }
    return this.reduce(([match, nonMatch]: [T[], T[]], item: T) => {
        if (filter(item)) {
            match.push(item);
        } else {
            nonMatch.push(item);
        }
        return [match, nonMatch];
    }, [[],[]]);
};

Array.prototype.toString = function<T>() {
    return '[ ' + this.map(item => item.toString ? item.toString() : item ).join(', ') + ' ]';
};

export function find(cards: Card[], sought: (3 | 4)[]) {
    const [wilds, nonWilds] = cards.bifilter(card => card.isWild());
    nonWilds.sort(Card.compare);
    wilds.sort(Card.compare);
    return findOptimimum(nonWilds, 0, wilds, 0, sought, sought.map(() => []));
}

// return number of cards left
function findOptimimum(cards: Card[], cardIndex: number, wilds: Card[], wildsIndex: number, sought: (3 | 4)[], runs: Card[][]): [number, number, Card[][]] {
    // console.log(runs.map(run => run.map(card => card.toString())));
    if(wildsIndex > wilds.length) {
        return [Infinity, Infinity, sought.map(() => [])];
    }
    if(cardIndex >= cards.length) {
        let missing = 0;
        for(let i = 0; i < sought.length; i++) {
            let missed = sought[i] - runs[i].length;
            // console.log(missed);
            if(missed > 0) {
                const wildsToUse = Math.min(missed, wilds.length - wildsIndex, runs[i].length);
                missed -= wildsToUse;
                const newRuns = runs.slice();
                newRuns[i] = newRuns[i].slice();
                newRuns[i].push(...wilds.slice(wildsIndex, wildsToUse + wildsIndex));
                wildsIndex += wildsToUse;
                missing += missed;
                runs = newRuns;
            }
        }
        if(missing < 0) {
            return [0, wilds.slice(wilds.length - missing - 1).map(card => card.rank.value).reduce((a,b) => a + b, 0), runs];
        }
        if(wilds.length > wildsIndex) {
            for(let i = 0; i < sought.length; i++) {
                const wildsToUse = Math.min(wilds.length - wildsIndex, runs[i].length);
                const newRuns = runs.slice();
                newRuns[i] = newRuns[i].slice();
                newRuns[i].push(...wilds.slice(wildsIndex, wildsToUse + wildsIndex));
                wildsIndex += wildsToUse;
                runs = newRuns;
            }
        }
        return [missing, 0, runs];
    }
    const reduction = <S, T>(a: [S, S, T], b: [S, S, T]): [S, S, T] => {
        if(a[0] > b[0]) {
            return b;
        } else if(a[0] === b[0]) {
            if(a[1] > b[1]) {
                return b;
            } else {
                return a;
            }
        } else {
            return a;
        }
    };
    let noChoose: [number, number, Card[][]];
    {
        const recurse = findOptimimum(cards, cardIndex + 1, wilds, wildsIndex, sought, runs);
        noChoose = [recurse[0], recurse[1] + cards[cardIndex].rank.value, recurse[2]];
    }
    const choices: [number, number, Card[][]][] = sought.map((_, index) => index).filter(index => {
        if(runs[index].length > 0) {
            if(sought[index] === 4) {
                if (runs[index][0].suit !== cards[cardIndex].suit || runs[index][runs[index].length - 1].rank === cards[cardIndex].rank) {
                    return false;
                }
            } else {
                if (runs[index][0].rank !== cards[cardIndex].rank) {
                    return false;
                }
            }
        } else {
            if (sought[index] === 4) {
                for(let x = 0; x < sought.length; x++) {
                    if(x === index || sought[x] !== 4 || runs[x].length === 0) {
                        continue;
                    }
                    if (runs[x][0].suit === cards[cardIndex].suit) {
                        return false;
                    }
                }
            } else {
                for(let x = 0; x < sought.length; x++) {
                    if(x === index || sought[x] !== 3 || runs[x].length === 0) {
                        continue;
                    }
                    if (runs[x][0].rank === cards[cardIndex].rank) {
                        return false;
                    }
                }
            }
        }
        return true;
    }).map(index => {
        let wildsUsed = 0;
        let created = [];
        if(runs[index].length > 0 && sought[index] === 4) {
            const chosen = runs[index].slice();
            wildsUsed = chosen[chosen.length - 1].rank.distance(cards[cardIndex].rank) - 1;
            if(wildsUsed + wildsIndex > wilds.length) {
                return [Infinity, Infinity, sought.map(() => [])];
            }
            chosen.push(...wilds.slice(wildsIndex, wildsIndex + wildsUsed));
            chosen.push(cards[cardIndex]);
            created = chosen;
        } else {
            created = [...runs[index], cards[cardIndex]];
        }
        const newRuns = runs.slice();
        newRuns.splice(index, 1, created);
        return findOptimimum(cards, cardIndex + 1, wilds, wildsIndex + wildsUsed, sought, newRuns);
    });
    choices.push(noChoose);
    return choices.reduce(reduction);
}