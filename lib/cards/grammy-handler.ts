import { Handler } from "./handler";
import { Card } from "./card";
import { Run } from "./run";

export class GrammyHandler extends Handler {

    public getName(): string {
        return "Grammy";
    }

    public message(bundle: any): void {
    }

    public async wantCard(card: Card, hand: Card[], played: Run[], roun: number[], isTurn: boolean, last: boolean) {
        return true;
    }

    public async turn(hand: Card[], played: Run[][], position: number, roun: number[], last: boolean)
    : Promise<{ toDiscard: Card, toPlay: Run[][] } | null> {
        hand.sort(Card.compare).reverse();
        let result = { toDiscard: hand[0], toPlay: played };
        return new Promise(resolve => {
            setTimeout(function() {
              resolve(result)
            }, 1000);
        });
    }
}
