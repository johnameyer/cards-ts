import { Card } from '../../cards/card.js';
import { Presentable } from '../../intermediary/presentable.js';
import { Message } from '../message.js';

function generateMessage(card: Card, player?: string, extra = false): Presentable[] {
    if (player !== undefined) {
        if (extra) {
            return [player, 'picked up the', card, 'and an extra'];
        }
        return [player, 'picked up the', card];
    }
    return ['No player picked up the', card];
}

/**
 * A class designating to a handler that anpther player has picked up a card, or that a card was not picked up at all
 * @category Message
 */
export class PickupMessage extends Message {
    public readonly type = 'pickup-message';

    /**
     * Designates that a card was not picked up
     */
    constructor(card: Card);

    /**
     * Designates that a card was picked up by a player
     */
    constructor(card: Card, player: string, extra: boolean);

    /**
     * @param card the card the player picked up
     * @param player the player picking up the card
     * @param extra whether or not an extra card was taken
     */
    constructor(public readonly card: Card, public readonly player?: string, public readonly extra: boolean = false) {
        super(generateMessage(card, player, extra));
    }
}
