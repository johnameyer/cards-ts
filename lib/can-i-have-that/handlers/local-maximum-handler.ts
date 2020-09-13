import { Handler } from "../handler";
import { Card } from "../../cards/card";
import { Run } from "../../cards/run";
import { find } from "../../cards/find";
import { ThreeCardSet } from "../../cards/three-card-set";
import { FourCardRun } from "../../cards/four-card-run";
import { HandlerData } from "../handler-data";

export class LocalMaximumHandler implements Handler {
    constructor(private timeout?: number) {
    }
    
    public getName(taken: string[]): string {
        return ['Max', 'Maxwell', 'Maximilian', 'Maxine', 'Maximo', 'Maximus'].find(str => !taken.includes(str)) || 'Max';
    }
    
    public message(bundle: any) {
    }

    waitingFor(who: string | undefined): void {
    }
    
    public async wantCard(card: Card, isTurn: boolean, {hand, played, position, round, gameParams: {rounds}}: HandlerData): Promise<[boolean]> {
        let currentRound = rounds[round];
        if(played[position].length > 0) {
            return [false];
        }
        if(card.isWild()) {
            // console.log(position, 'want wild', card.toString());
            return [true];
        }
        const oldFound = find([...hand], currentRound);
        const newFound = find([card, ...hand], currentRound);
        const advantage = newFound[0] - oldFound[0];
        if(oldFound[0] === 0 && newFound[0] === 0 && isTurn && newFound[1] <= oldFound[1]) {
            // pickup card if it is our turn, we have already completed, and it doesn't add value to us
            // console.log(position, 'want card', card.toString());
            // console.log(oldFound.toString());
            // console.log(newFound.toString());
            return [true];
        }
        if(round !== rounds.length - 1) {
            if(advantage < 0) {
                // if not last round and card would benefit us, grab it
                return [true];
            }
        } else {
            if(advantage < 0) {
                //if last round and card would benefit us
                // grab only if we are lacking many cards or it will be our turn
                if(oldFound[0] > 3 || isTurn) {
                    // console.log(position, 'want card', card.toString());
                    // console.log(oldFound.toString());
                    // console.log(newFound.toString());
                    return [true];
                }
            }
        }
        return [false];
    }
    
    public async turn({hand, played, position, round, gameParams: {rounds}}: HandlerData)
    : Promise<{ toDiscard: Card, toPlay: Run[][] }> {
        let currentRound = rounds[round];
        let result: { toDiscard: Card, toPlay: Run[][] };
        if(played[position].length === 0) {
            const found = find([...hand], currentRound);
            // console.log(currentRound.toString(), position, found.toString());
            // console.log(position, found.toString());
            const without = (arr: Card[], card: Card) => {let result = arr.slice(); result.splice(arr.indexOf(card), 1); return result};
            let toDiscard;
            let toPlay = played;
            if(found[0] === 0 && (rounds.length - 1 !== round || found[1] === 0)) {
                //TODO with handling of no discard on all down move this up
                // console.log(position, 'can play', found[2].toString());
                toPlay[position] = found[2].map((cards, i) => currentRound[i] == 3 ? new ThreeCardSet(cards) : new FourCardRun(cards));
                found[2].forEach(run => run.forEach(card => hand.splice(hand.findIndex(c => card.equals(c)), 1)));
                for(let i = 0; i < hand.length; i++) {
                    let card = hand[i];
                    for(let run of played.reduce((a, b) => { a.push(...b); return a; }, [])) {
                        if(run.isLive(card)) {
                            run.add(card);
                            hand.splice(i, 1);
                            i--;
                            break;
                        }
                    }
                }
                toDiscard = hand[0] || null; //TODO better
            } else {
                let nonlive = [];
                if(found[0] === 0) {
                    nonlive.push(...found[3].filter(card => !played.some(player => player.some(play => play.isLive(card)))));
                }
                if(!nonlive.length) {
                    nonlive.push(...hand.filter(card => !played.some(player => player.some(play => play.isLive(card)))));
                }
                if(nonlive.some(card => !card.isWild())) {
                    // otherwise has a tendency to discard wilds which normally benefits other players more than us
                    nonlive = nonlive.filter(card => !card.isWild());
                }
                const finds = nonlive.map(card => find(without(hand, card), currentRound) );
                let worst = 0;
                for(let i = 0; i < finds.length; i++) {
                    //TODO can even add logic about discarding cards others don't desire
                    if(finds[i][0] == finds[worst][0]) {
                        if(finds[i][1] < finds[worst][1]) {
                            worst = i;
                        }
                    } else {
                        if(finds[i][0] < finds[worst][0]) {
                            worst = i;
                        }
                    }
                }
                toDiscard = nonlive[worst];
            }
            result = { toDiscard, toPlay };
        } else {
            for(let i = 0; i < hand.length; i++) {
                let card = hand[i];
                for(let run of played.reduce((a, b) => { a.push(...b); return a; }, [])) {
                    if(run.isLive(card)) {
                        run.add(card);
                        hand.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
            result = { toDiscard: hand[0], toPlay: played };
        }
        
        return new Promise(resolve => {
            setTimeout(function() {
                resolve(result)
            }, this.timeout || 500);
        });
    }
}
