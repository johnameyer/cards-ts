import { Card } from "../../cards/card";
import { Message } from "../../games/message";
import { Serializable } from "../../intermediary/presenter";

function generateMessage(cards: Card[]): Serializable[] {
    return ['Received', cards];
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 */
export class DealOutMessage extends Message {
    /**
     * @param card the card being received
     */
    constructor(public readonly cards: Card[]) {
        super(generateMessage(cards));
    }
}