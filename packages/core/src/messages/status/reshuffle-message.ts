import { Message } from '../message.js';

/**
 * A class designating that the deck was reshuffled
 * @category Message
 */
export class ReshuffleMessage extends Message {
    constructor() {
        super([ 'The deck was reshuffled' ]);
    }
}
