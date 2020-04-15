import { Card } from "../card";
import { Message } from "./message";

function generateMessage(card: Card, extra?: Card, dealt?: boolean) {
    if (dealt) {
        return 'Received ' + card.toString();
    } else {
        if (extra) {
            return 'Picked up ' + card.toString() + ' and ' + extra.toString();
        } else {
            return 'Picked up ' + card.toString();
        }
    }
}

export class DealMessage extends Message {
    constructor(card: Card, extra?: Card, dealt?: boolean) {
        super(generateMessage(card, extra, dealt));
    }
}