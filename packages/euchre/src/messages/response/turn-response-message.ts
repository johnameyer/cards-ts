import { Card, Message } from '@cards-ts/core';

/**
 * Designates that a card is to be played and optionally data to be set for this player
 */
export class TurnResponseMessage extends Message {
    readonly type = 'turn-response';

    constructor(public readonly card: Card) {
        super(['Played', card]);
    }
}
