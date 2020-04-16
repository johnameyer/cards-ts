import { Handler } from "./handler";
import { Card } from "../card";
import { Run } from "../run";
import { Suit } from "../suit";
import { Rank } from "../rank";
import { find } from "../find";
import { ThreeCardSet } from "../three-card-set";
import { FourCardRun } from "../four-card-run";

export class LocalMaximumHandler extends Handler {
    
    public getName(): string {
        return "Max";
    }
    
    public message(bundle: any): void {
    }
    
    public async wantCard(card: Card, hand: Card[], played: Run[][], position: number, round: (3 | 4)[], isTurn: boolean, last: boolean) {
        if(played[position].length > 0) {
            return false;
        }
        if(card.isWild()) {
            // console.log(position, 'want wild', card.toString());
            return true;
        }
        if(find([card, ...hand], round)[0] - find([...hand], round)[0] < 0) {
            // console.log(position, 'want card', card.toString());
            // console.log(hand.map(card => card.toString()));
            // console.log(find([card, ...hand], round)[0], find([...hand], round)[0]);
            return true;
        }
        return false;
    }
    
    public async turn(hand: Card[], played: Run[][], position: number, round: (3 | 4)[], last: boolean)
    : Promise<{ toDiscard: Card, toPlay: Run[][] }> {
        let result: { toDiscard: Card, toPlay: Run[][] };
        // console.log(position, hand.map(card => card.toString()));
        if(played[position].length == 0) {
            const found = find([...hand], round);
            const without = (arr: Card[], card: Card) => {let result = arr.slice(); result.splice(arr.indexOf(card), 1); return result};
            let toDiscard;
            let toPlay = played;
            if(found[0] == 0) {
                //TODO with handling of no discard on all down move this up
                // console.log(position, 'can play', found[2].toString());
                toPlay[position] = found[2].map((cards, i) => round[i] == 3 ? new ThreeCardSet(cards) : new FourCardRun(cards));
                found[2].forEach(run => run.forEach(card => hand.splice(hand.findIndex(c => card.equals(c)), 1)));
                toDiscard = hand[0]; //TODO better
            } else {
                const finds = hand.map(card => find(without(hand, card), round) );
                let worst = 0;
                for(let i = 0; i < hand.length; i++) {
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
                toDiscard = hand[worst];
            }
            // console.log(toDiscard.toString());
            result = { toDiscard, toPlay };
        } else {
            //TODO play live cards
            result = { toDiscard: hand[0], toPlay: played };
        }
        
        return new Promise(resolve => {
            setTimeout(function() {
                resolve(result)
            }, 500);
        });
    }
}
