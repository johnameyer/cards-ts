import { Handler } from "./handler";
import { Card } from "../card";
import { Run } from "../run";
import { GameState } from "../game-state";
import { HandlerData, HandlerCustomData } from "./handler-data";

export class GrammyHandler implements Handler {

    public getName(): string {
        return "Grammy";
    }

    public message(_bundle: any): void {
    }

    public async wantCard(_card: Card, _isTurn: boolean, gameState: HandlerData): Promise<[boolean, HandlerCustomData]> {
        return [true, gameState.data];
    }

    public async turn({hand, played, data}: HandlerData)
    : Promise<{ toDiscard: Card, toPlay: Run[][], data: HandlerCustomData }> {
        hand.sort(Card.compare).reverse();
        let result = { toDiscard: hand[0], toPlay: played, data };
        return new Promise(resolve => {
            setTimeout(function() {
              resolve(result)
            }, 500);
        });
    }
}
