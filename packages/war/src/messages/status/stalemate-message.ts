import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(): Serializable[] {
    return ['Game went over the max number of battles'];
}

/**
 * Class that denotes that a player won
 */
export class StalemateMessage extends Message {

    public readonly type = 'stalemate-message';

    constructor() {
        super(generateMessage());
    }
}