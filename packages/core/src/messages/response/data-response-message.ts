import { Message } from '../message.js';

/**
 * Sets the data for this player to the data provided
 * @category Message
 */
export class DataResponseMessage extends Message {
    readonly type = 'data-response';

    constructor(public readonly data: any) {
        super([]);
    }
}
