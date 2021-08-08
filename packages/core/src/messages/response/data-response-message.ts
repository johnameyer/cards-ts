import { Message } from "../message";

/**
 * Sets the data for this player to the data provided
 */
export class DataResponseMessage extends Message {
    readonly type = 'data-response';

    constructor(public readonly data: any) {
        super([]);
    }
}