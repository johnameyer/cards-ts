import { Message } from "@cards-ts/core";

/**
 * Sets the data for this player to the data provided
 */
export class DataResponseMessage extends Message {
    readonly type = 'data-response';

    constructor(public readonly data: any) {
        super([]);
    }
}