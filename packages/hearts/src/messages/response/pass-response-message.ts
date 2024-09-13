import { Card, Message } from '@cards-ts/core';

/**
 * Passes a certain number of cards and optionally sets the data for this player
 */
export class PassResponseMessage extends Message {
    readonly type = 'pass-response';

    constructor(public readonly cards: Card[]) {
        super(['Passed', cards]);
    }
}
