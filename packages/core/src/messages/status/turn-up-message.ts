import { Card } from '../../cards/card';
import { Presentable } from '../../intermediary/presentable';
import { Message } from '../message';

function generateMessage(card: Card): Presentable[] {
    return [ card, 'was turned over' ];
}

/**
 * Class that denotes to a handler that a card was flipped over
 * @category Message
 */
export class TurnUpMessage extends Message {

    public readonly type = 'turn-up-message';

    /**
     * @param card the card that was turned over
     */
    constructor(public readonly card: Card) {
        super(generateMessage(card));
    }
}
