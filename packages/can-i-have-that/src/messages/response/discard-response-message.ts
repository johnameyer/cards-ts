import { Card, Message } from '@cards-ts/core';

export class DiscardResponseMessage extends Message {
    public readonly type = 'discard-response';

    constructor(public readonly toDiscard: Card) {
        super(['Discarded', toDiscard]);
    }
}
