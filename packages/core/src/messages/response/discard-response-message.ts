import { Card } from '../../cards/card';
import { Message } from '../message';

export class DiscardResponseMessage extends Message {
    public readonly type = 'discard-response';

    constructor(public readonly toDiscard: Card, public readonly data?: any) {
        super([ 'Discarded', toDiscard ]);
    }
}
