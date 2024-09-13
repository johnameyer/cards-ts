import { Card, Message } from '@cards-ts/core';

/**
 * Designates that the dealer has selected a card to discard
 */
export class DealerDiscardResponseMessage extends Message {
    readonly type = 'dealer-discard-response';

    constructor(public readonly selected: Card) {
        super(['Discarded', selected]);
    }
}
