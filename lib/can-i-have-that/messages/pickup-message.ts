import { Message } from "../../games/message";
import { Card } from "../../cards/card";
import { Serializable } from "../../intermediary/presenter";

function generateMessage(card: Card, player?: string, extra:boolean = false): Serializable[] {
    if(player !== undefined) {
        if(extra) {
            return [player, 'picked up the', card, 'and an extra'];
        } else {
            return [player, 'picked up the', card];
        }
    } else {
        return ['No player picked up the', card];
    }
}

/**
 * A class designating to a handler that anpther player has picked up a card, or that a card was not picked up at all
 */
export class PickupMessage extends Message {
    /**
     * Designates that a card was not picked up
     */
    constructor(card: Card);
    /**
     * Designates that a card was picked up by a player
     */
    constructor(card: Card, player: string, extra:boolean);
    /**
     * @param card the card the player picked up
     * @param player the player picking up the card
     * @param extra whether or not an extra card was taken
     */
    constructor(public readonly card: Card, public readonly player?: string, public readonly extra:boolean = false) {
        super(generateMessage(card, player, extra));
    }
}