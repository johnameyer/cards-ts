import { Handler } from "../handler";
import { Card } from "@cards-ts/core";
import { HandlerData } from "../handler-data";
import { Meld } from "@cards-ts/core/lib/cards/meld";

export class GrammyHandler implements Handler {
    public getName(): string {
        return "Grammy";
    }

    public message(_bundle: any): void {
    }
    
    waitingFor(who: string | undefined): void {
    }


    public async wantCard(_card: Card, _isTurn: boolean, gameState: HandlerData): Promise<[boolean, unknown]> {
        return [true, gameState.data];
    }

    public async turn({hand, played, data}: HandlerData)
    : Promise<{ toDiscard: Card, toPlay: Meld[][], data: unknown }> {
        hand.sort(Card.compare).reverse();
        let result = { toDiscard: hand[0], toPlay: played, data };
        return new Promise(resolve => {
            setTimeout(function() {
              resolve(result)
            }, 500);
        });
    }
}
