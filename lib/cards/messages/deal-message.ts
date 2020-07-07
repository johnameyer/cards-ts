import { Card } from "../card";
import { Message } from "./message";

function generateMessage(card: Card, extra?: Card) {
    if (extra) {
        return 'Picked up ' + card.toString() + ' and ' + extra.toString();
    } else {
        return 'Picked up ' + card.toString();
    }
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 */
export class DealMessage extends Message {
    /**
     * @param card the card being received
     * @param extra the extra card that is drawn if applicable
     * @param dealt whether or not the card was dealt
     */
    constructor(public readonly card: Card, public readonly extra?: Card) {
        super(generateMessage(card, extra));
    }
}