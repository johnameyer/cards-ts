import { Card } from "@cards-ts/core";
import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(cards: Card[]): Serializable[] {
    return ['Received', cards];
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 */
export class DealOutMessage extends Message {

    public readonly type = 'deal-out-message';

    /**
     * @param card the card being received
     */
    constructor(public readonly cards: Card[]) {
        super(generateMessage(cards));
    }
}