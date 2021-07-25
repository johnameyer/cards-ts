import { Card, Message, Presentable } from "@cards-ts/core";

function generateMessage(cards: Card[]): Presentable[] {
    return ['Received', cards];
}

/**
 * Class that denotes to a handler that they have been dealt certain cards
 */
export class DealOutMessage extends Message {

    public readonly type = 'deal-out-message';

    /**
     * @param cards the cards being received
     */
    constructor(public readonly cards: Card[]) {
        super(generateMessage(cards));
    }
}