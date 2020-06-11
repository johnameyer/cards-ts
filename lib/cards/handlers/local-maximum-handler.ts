import { Handler } from "./handler";
import { Card } from "../card";
import { Run } from "../run";
import { Suit } from "../suit";
import { Rank } from "../rank";
import { find } from "../find";
import { ThreeCardSet } from "../three-card-set";
import { FourCardRun } from "../four-card-run";
import { HandlerData } from "./handler-data";

export class LocalMaximumHandler implements Handler {
    
    public getName(): string {
        return "Max";
    }
    
    public message(bundle: any) {
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
        if(find([card, ...hand], currentRound)[0] - find([...hand], currentRound)[0] < 0) {
            // console.log(position, 'want card', card.toString());
            // console.log(hand.map(card => card.toString()));
            // console.log(find([card, ...hand], round)[0], find([...hand], round)[0]);
            return [true];
        }
        return [false];
    }
    
    public async turn({hand, played, position, round, gameParams: {rounds}}: HandlerData)
    : Promise<{ toDiscard: Card, toPlay: Run[][] }> {
        let currentRound = rounds[round];
        let result: { toDiscard: Card, toPlay: Run[][] };
        // console.log(position, hand.map(card => card.toString()));
        if(played[position].length == 0) {
            const found = find([...hand], currentRound);
            const without = (arr: Card[], card: Card) => {let result = arr.slice(); result.splice(arr.indexOf(card), 1); return result};
            let toDiscard;
            let toPlay = played;
            if(found[0] == 0) {
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
                toDiscard = hand[0]; //TODO better
            } else {
                const nonlive = hand.filter(card => !played.some(player => player.some(play => play.isLive(card))));
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
            }, 500);
        });
    }
}
