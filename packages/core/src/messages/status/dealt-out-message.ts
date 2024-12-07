import { Card } from '../../cards/card.js';
import { Presentable } from '../../intermediary/presentable.js';
import { Message } from '../message.js';

function generateMessage(cards: Card[]): Presentable[] {
    return [ 'Received', cards ];
}

// TODO rename? Different classes for different sources or enum?
/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 * @category Message
 */
export class DealtOutMessage extends Message {
    public readonly type = 'dealt-out-message';

    /**
     * @param cards the cards being received
     */
    constructor(public readonly cards: Card[]) {
        super(generateMessage(cards));
    }
}
