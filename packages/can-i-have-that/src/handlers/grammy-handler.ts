import { Handler } from "../handler";
import { Card } from "@cards-ts/core";
import { HandlerData } from "../handler-data";
import { TurnResponseMessage, WantCardResponseMessage } from "../messages/response";

export class GrammyHandler implements Handler {
    public message(): [] {
        return [];
    }
    
    public waitingFor(): [] {
        return [];
    }


    public wantCard(gameState: HandlerData): [undefined, WantCardResponseMessage] {
        return [, new WantCardResponseMessage(true, gameState.data)];
    }

    public turn({hand, played, data}: HandlerData): [undefined, TurnResponseMessage] {
        return [, new TurnResponseMessage(hand.sort(Card.compare).reverse()[0], played, data)];
    }
}
