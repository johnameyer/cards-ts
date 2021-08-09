import { Card } from '../../cards/card';
import { Presentable } from '../../intermediary/presentable';
import { Message } from '../message';

function generateMessage(cards: Card[]): Presentable[] {
    return [ 'Received', cards ];
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 */
export class DealtOutMessage extends Message {
    /**
     * @param card the card being received
     * @param extra the extra card that is drawn if applicable
     * @param dealt whether or not the card was dealt
     */
    constructor(public readonly cards: Card[]) {
        super(generateMessage(cards));
    }
}
