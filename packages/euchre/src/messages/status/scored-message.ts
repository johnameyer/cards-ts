import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(points: number): Serializable[] {
    return ['Received', points, 'points'];
}

/**
 * Class that denotes to a handler that they have received a number of points at the end of the round
 */
export class ScoredMessage extends Message {

    public readonly type = 'scored-message';

    /**
     * @param points the points being received
     */
    constructor(public readonly points: number) {
        super(generateMessage(points));
    }
}