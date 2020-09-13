import { Message } from "../../games/message";

function generateMessage(leader: string): Message.Component[] {
    return [leader, 'leads next trick'];
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 */
export class LeadsMessage extends Message {
    /**
     * @param leader the hand that is leading
     */
    constructor(public readonly leader: string) {
        super(generateMessage(leader));
    }
}