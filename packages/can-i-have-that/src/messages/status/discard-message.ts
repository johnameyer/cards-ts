import { Card, Serializable, Message } from "@cards-ts/core";

function generateMessage(card: Card, player?: string): Serializable[] {
    if(player) {
        return [player, 'discarded', card];
    } else {
        return ['First card is', card];
    }
}

/**
 * Class that denotes to a handler that a player has discarded a card
 */
export class DiscardMessage extends Message {
    // TODO consider how to represent the player better for programmatic handlers' tracking
    /**
     * @param card the card being discarded
     * @param player the player discarding the card
     */
    constructor(public readonly card: Card, public readonly player?: string) {
        super(generateMessage(card, player));
    }
}