import { Serializable, Message } from "@cards-ts/core";
import { roundToString } from "../util/round-to-string";

function generateMessage(round: readonly number[]): Serializable[] {
    return roundToString(round);
}

/**
 * A class designating that a new round has started
 */
export class StartRoundMessage extends Message {
    /**
     * @param round the new round
     */
    constructor(public readonly round: readonly number[]) {
        super(generateMessage(round));
    }
}