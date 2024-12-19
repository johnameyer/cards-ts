import { Message } from '../message.js';

/**
 * Designates that a player ran out of cards
 * @category Message
 */
export class OutOfCardsMessage extends Message {
    public readonly type = 'out-of-cards-message';

    constructor(public readonly name: string) {
        super([ name, 'is out of cards' ]);
    }
}
