import { Message } from "../../games/message";
import { number } from "yargs";

function generateMessage(numToPass: number, passing: number, numPlayers: number): Message.Component[] {
    if(passing === numPlayers / 2) {
        return ['Passing', numToPass, 'cards across'];
    } else if(passing < 0) {
        return ['Passing', numToPass, 'cards', -passing, 'to the left'];
    } else {
        return ['Passing', numToPass, 'cards', passing, 'to the right'];
    }
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 */
export class PassingMessage extends Message {
    /**
     * @param shooter the hand that is leading
     */
    constructor(public readonly numToPass: number, public readonly passing: number, public readonly numPlayers: number) {
        super(generateMessage(numToPass, passing, numPlayers));
    }
}