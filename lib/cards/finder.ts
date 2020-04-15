import { Card } from "./card";

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
}

Array.prototype.toString = function<T>() {
    return "[ " + this.map(item => item.toString ? item.toString() : item ).reduce((a,b) => a + b) + " ]";
}

let i = 0;

function find(cards: Card[], sought: number[]) {
    let [wilds, nonWilds] = cards.bifilter(card => card.isWild());
    nonWilds.sort(Card.compare);
    wilds.sort(Card.compare);
    i = 0;
    return findOptimimum(nonWilds, 0, wilds, 0, sought, sought.map(() => []));
}



//return number of cards left
function findOptimimum(cards: Card[], cardIndex: number, wilds: Card[], wildsIndex: number, sought: number[], runs: Card[][]): [number, number, Card[][]] {
    console.log(i++);
    if(wildsIndex > wilds.length) {
        return [Infinity, Infinity, sought.map(() => [])];
    }
    if(cardIndex >= cards.length) {
        let missing = 0;
        for(let i = 0; i < sought.length; i++) {
            let missed = sought[i] - runs[i].length;
            if(missed > 0) {
                let wildsToUse = Math.min(missed, wilds.length - wildsIndex);
                missed -= wildsToUse;
                let newRuns = runs.slice();
                newRuns[i] = newRuns[i].slice();
                newRuns[i].push(...wilds.splice(wildsIndex, wildsToUse + wildsIndex));
                missing += missed;
            }
        }
        //console.log(missed, runs.map(run => run.map(card => card.toString())));
        if(missing < 0) {
            return [0, wilds.slice(wilds.length - missing - 1).map(card => card.rank.value).reduce((a,b) => a + b, 0), runs];
        }
        return [missing, 0, runs];
    }
    const reduction = <S, T>(a: [S, S, T], b: [S, S, T]): [S, S, T] => {
        if(a[0] > b[0]) {
            return b;
        } else if(a[0] == b[0]) {
            //points analysis
            return a;
        } else {
            return a;
        }
    };
    let noChoose: [number, number, Card[][]];
    {
        let recurse = findOptimimum(cards, cardIndex + 1, wilds, wildsIndex, sought, runs);
        noChoose = [recurse[0], recurse[1] + cards[cardIndex].rank.value, recurse[2]]; 
    }
    let choices: [number, number, Card[][]][] = sought.map((_, index) => index).filter(index => {
        if(runs[index].length > 0) {
            if(sought[index] == 4) {
                if (runs[index][0].suit != cards[cardIndex].suit || runs[index][runs[index].length - 1].rank == cards[cardIndex].rank) {
                    return false;
                }
            } else {
                if (runs[index][0].rank != cards[cardIndex].rank) {
                    return false;
                }
            }
        } else {
            if (sought[index] == 4) {
                for(let x = 0; x < sought.length; x++) {
                    if(x == index || sought[x] != 4 || runs[x].length == 0) {
                        break;
                    }
                    if (runs[x][0].suit == cards[cardIndex].suit) {
                        return false;
                    }
                }
            } else {
                for(let x = 0; x < sought.length; x++) {
                    if(x == index || sought[x] != 3 || runs[x].length == 0) {
                        break;
                    }
                    if (runs[x][0].rank == cards[cardIndex].rank) {
                        return false;
                    }
                }
            }
        }
        return true;
    }).map((index) => {
        let wildsUsed = 0;
        let created = [];
        if(runs[index].length > 0 && sought[index] == 4) {
            let chosen = runs[index].slice();
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
        let newRuns = runs.slice();
        newRuns.splice(index, 1, created);
        return findOptimimum(cards, cardIndex + 1, wilds, wildsIndex + wildsUsed, sought, newRuns);
    });
    choices.push(noChoose);
    return choices.reduce(reduction);
}