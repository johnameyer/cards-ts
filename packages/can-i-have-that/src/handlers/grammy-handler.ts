import { Handler } from "../handler";
import { Card, HandlerResponsesQueue } from "@cards-ts/core";
import { HandlerData } from "../handler-data";
import { TurnResponseMessage, WantCardResponseMessage } from "../messages/response";

export class GrammyHandler implements Handler {
    public message() {
    }
    
    public waitingFor() {
    }


    public wantCard(gameState: HandlerData, responsesQueue: HandlerResponsesQueue<WantCardResponseMessage>) {
        responsesQueue.push(new WantCardResponseMessage(true, gameState.data));
    }

    public turn({hand, played, data}: HandlerData, responsesQueue: HandlerResponsesQueue<TurnResponseMessage>) {
        responsesQueue.push(new TurnResponseMessage(hand.sort(Card.compare).reverse()[0], played, data));
    }
}
