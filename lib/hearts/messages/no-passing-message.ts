import { Message } from "../../games/message";

function generateMessage(): Message.Component[] {
    return ['No passing this round'];
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 */
export class NoPassingMessage extends Message {
    /**
     * @param shooter the hand that is leading
     */
    constructor() {
        super(generateMessage());
    }
}