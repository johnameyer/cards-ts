import { GameHandler } from '../game-handler';
import { Card, HandlerResponsesQueue } from '@cards-ts/core';
import { HandlerData } from '../handler-data';
import { DiscardResponseMessage, WantCardResponseMessage } from '../messages/response';

export class GrammyHandler extends GameHandler {
    handleWantCard = (gameState: HandlerData, responsesQueue: HandlerResponsesQueue<WantCardResponseMessage>) => {
        responsesQueue.push(new WantCardResponseMessage(true, gameState.data));
    }

    handleTurn = ({hand, data}: HandlerData, responsesQueue: HandlerResponsesQueue<DiscardResponseMessage>) => {
        responsesQueue.push(new DiscardResponseMessage(hand.sort(Card.compare).reverse()[0], data));
    }
}
