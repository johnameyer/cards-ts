import { Card } from '../../cards/card.js';
import { Presentable } from '../../intermediary/presentable.js';
import { Message } from '../message.js';

function generateMessage(cards: Card[]): Presentable[] {
    return ['Received', cards];
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 * @category Message
 */
export class DealtOutMessage extends Message {
    public readonly type = 'deal-out-message';

    /**
     * @param card the card being received
     * @param extra the extra card that is drawn if applicable
     * @param dealt whether or not the card was dealt
     */
    constructor(public readonly cards: Card[]) {
        super(generateMessage(cards));
    }
}
