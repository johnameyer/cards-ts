import { Card } from '../../cards/card.js';
import { Message } from '../message.js';

/**
 * Designates that a card is to be played and optionally data to be set for this player
 * @category Message
 */
export class PlayCardResponseMessage extends Message {
    readonly type = 'turn-response';

    constructor(public readonly card: Card) {
        super([ 'Played', card ]);
    }
}
