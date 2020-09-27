import { Message } from "@cards-ts/core";

function generateMessage(shooter: string) {
    return [shooter, 'shot the moon'];
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 */
export class ShotTheMoonMessage extends Message {
    /**
     * @param shooter the hand that is leading
     */
    constructor(public readonly shooter: string) {
        super(generateMessage(shooter));
    }
}