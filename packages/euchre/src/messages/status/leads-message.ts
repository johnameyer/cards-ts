import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(leader: string): Serializable[] {
    return [leader, 'leads next trick'];
}

/**
 * Class that denotes to a handler that a certain player is leading this round
 */
export class LeadsMessage extends Message {

    public readonly type = 'leads-message';

    /**
     * @param leader the hand that is leading
     */
    constructor(public readonly leader: string) {
        super(generateMessage(leader));
    }
}