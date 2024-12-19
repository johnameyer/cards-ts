import { Message } from '../message.js';

/**
 * A class designating that the deck was reshuffled
 * @category Message
 */
export class ReshuffleMessage extends Message {
    public readonly type = 'reshuffle-message';

    constructor() {
        super([ 'The deck was reshuffled' ]);
    }
}
