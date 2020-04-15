import { Message } from "./message";
import { Card } from "../card";

function generateMessage(card: Card, player?: string) {
    if(player) {
        return player + ' discarded ' + card.toString();
    } else {
        return 'First card is ' + card.toString();
    }
}

export class DiscardMessage extends Message {
    constructor(public readonly card: Card, public readonly player?: string) {
        super(generateMessage(card, player));
    }
}