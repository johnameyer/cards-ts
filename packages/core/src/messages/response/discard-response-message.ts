import { Card } from '../../cards/card.js';
import { Message } from '../message.js';

/**
 * Designates a card to be discarded
 * @category Message
 */
export class DiscardResponseMessage extends Message {
    public readonly type = 'discard-response';

    constructor(public readonly toDiscard: Card, public readonly data?: any) {
        super([ 'Discarded', toDiscard ]);
    }
}
