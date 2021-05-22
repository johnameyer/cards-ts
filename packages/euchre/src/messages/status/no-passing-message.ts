import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(): Serializable[] {
    return ['No passing this round'];
}

/**
 * Class that denotes to a handler that there is no passing this round
 */
export class NoPassingMessage extends Message {

    public readonly type = 'no-passing-message';

    constructor() {
        super(generateMessage());
    }
}