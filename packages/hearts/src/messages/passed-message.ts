import { Card } from "@cards-ts/core";
import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(cards: Card[], from: string): Serializable[] {
    return ['Received', cards, 'from', from];
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 */
export class PassedMessage extends Message {
    /**
     * @param card the card being received
     */
    constructor(public readonly cards: Card[], public readonly from: string) {
        super(generateMessage(cards, from));
    }
}