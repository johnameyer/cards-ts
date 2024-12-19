import { GameHandler, HandlerData } from '../game-handler.js';
import { WantCardResponseMessage } from '../messages/response/index.js';
import { Card, DiscardResponseMessage, HandlerResponsesQueue } from '@cards-ts/core';

export class GrammyHandler extends GameHandler {
    handleWantCard = (gameState: HandlerData, responsesQueue: HandlerResponsesQueue<WantCardResponseMessage>) => {
        responsesQueue.push(new WantCardResponseMessage(true), gameState.data);
    };

    handleTurn = ({ hand, data }: HandlerData, responsesQueue: HandlerResponsesQueue<DiscardResponseMessage>) => {
        responsesQueue.push(new DiscardResponseMessage(hand.sort(Card.compare).reverse()[0]), data);
    };
}
