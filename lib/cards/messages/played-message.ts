import { Message } from "./message";
import { Card } from "../card";
import { Run } from "../run";

function generateMessage(cards: Card[], run: Run, player?: string) {
    return player + ' played ' + cards.map(card => card.toString()).join(', ') + ' on ' + run.toString();
}

export class PlayedMessage extends Message {
    constructor(public readonly cards: Card[], public readonly run: Run, public readonly player?: string) {
        super(generateMessage(cards, run, player));
    }
}