import { Card } from '../../cards/card';
import { Message } from '../message';

/**
 * Designates that a card is to be played and optionally data to be set for this player
 */
export class PlayCardResponseMessage extends Message {
    readonly type = 'turn-response';

    constructor(public readonly card: Card, public readonly data?: any) {
        super([ 'Played', card ]);
    }
}
