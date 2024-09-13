import { Card } from '../../cards/card.js';
import { Presentable } from '../../intermediary/presentable.js';
import { Message } from '../message.js';

function generateMessage(card: Card, player?: string): Presentable[] {
    if (player) {
        return [player, 'discarded', card];
    }
    return ['First card is', card];
}

/**
 * Class that denotes to a handler that a player has discarded a card
 * @category Message
 */
export class DiscardMessage extends Message {
    public readonly type = 'discard-message';

    // TODO consider how to represent the player better for programmatic handlers' tracking
    /**
     * @param card the card being discarded
     * @param player the player discarding the card
     */
    constructor(public readonly card: Card, public readonly player?: string) {
        super(generateMessage(card, player));
    }
}
