import { Message } from '../message';

/**
 * Designates that a player is dealer
 * @category Message
 */
export class DealerMessage extends Message {
    constructor(public readonly name: string) {
        super([ name, 'is dealer' ]);
    }
}
