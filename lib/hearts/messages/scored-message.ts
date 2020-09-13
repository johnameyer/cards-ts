import { Message } from "../../games/message";

function generateMessage(points: number): Message.Component[] {
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