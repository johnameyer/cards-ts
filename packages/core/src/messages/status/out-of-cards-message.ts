import { Message } from '../message';

/**
 * Designates that a player ran out of cards
 * @category Message
 */
export class OutOfCardsMessage extends Message {
    constructor(public readonly name: string) {
        super([ name, 'is out of cards' ]);
    }
}
