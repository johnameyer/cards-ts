import { Message } from "./message";
import { Card } from "../card";

function generateMessage(card: Card, player?: string, extra:boolean = false) {
    if(player !== undefined) {
        if(extra) {
            return player + ' picked up the ' + card.toString() + ' and an extra';
        } else {
            return player + ' picked up the ' + card.toString();
        }
    } else {
        return 'No player picked up the ' + card.toString();
    }
}

export class PickupMessage extends Message {
    constructor(card: Card);
    constructor(card: Card, player: string, extra:boolean);
    constructor(public readonly card: Card, public readonly player?: string, public readonly extra:boolean = false) {
        super(generateMessage(card, player, extra));
    }
}