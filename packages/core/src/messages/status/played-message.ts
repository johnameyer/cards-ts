import { Card } from '../../cards/card';
import { Meld } from '../../cards/meld';
import { Presentable } from '../../intermediary/presentable';
import { Message } from '../message';

function generateMessage(cards: Card[], meld: Meld, player: string): Presentable[] {
    if(cards.length === meld.cards.length) {
        return [ player, 'played', meld.toString() ];
    }
    return [ player, 'played', cards, 'on', meld.toString() ];
}

/**
 * A class designating that a player put down cards on the table
 * @category Message
 */
export class PlayedMessage extends Message {
    /**
     * @param cards the cards that were played
     * @param meld the run the cards were played on
     * @param player the player playing the cards
     */
    constructor(public readonly cards: Card[], public readonly meld: Meld, public readonly player: string) {
        super(generateMessage(cards, meld, player));
    }
}
