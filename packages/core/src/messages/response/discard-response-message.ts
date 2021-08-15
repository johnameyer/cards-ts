import { Card } from '../../cards/card';
import { Message } from '../message';

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
