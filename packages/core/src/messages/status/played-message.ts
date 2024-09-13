import { Card } from '../../cards/card.js';
import { Meld } from '../../cards/meld.js';
import { Presentable } from '../../intermediary/presentable.js';
import { Message } from '../message.js';

function generateMessage(cards: Card[], meld: Meld, player: string): Presentable[] {
    if (cards.length === meld.cards.length) {
        return [player, 'played', meld.toString()];
    }
    return [player, 'played', cards, 'on', meld.toString()];
}

/**
 * A class designating that a player put down cards on the table
 * @category Message
 */
export class PlayedMessage extends Message {
    public readonly type = 'played-message';

    /**
     * @param cards the cards that were played
     * @param meld the run the cards were played on
     * @param player the player playing the cards
     */
    constructor(public readonly cards: Card[], public readonly meld: Meld, public readonly player: string) {
        super(generateMessage(cards, meld, player));
    }
}
