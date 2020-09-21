import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(points: number): Serializable[] {
    return ['Received', points, 'points'];
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 */
export class ScoredMessage extends Message {
    /**
     * @param card the card being received
     */
    constructor(public readonly points: number) {
        super(generateMessage(points));
    }
}