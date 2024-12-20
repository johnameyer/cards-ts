import { Message } from '../message.js';

/**
 * Designates that a player is dealer
 * @category Message
 */
export class DealerMessage extends Message {
    public readonly type = 'dealer-message';

    constructor(public readonly name: string) {
        super([ name, 'is dealer' ]);
    }
}
