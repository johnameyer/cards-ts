import { Message } from "../../games/message";

function generateMessage(round: readonly number[]): Message.Component[] {
    const threes = round.filter(n => n == 3).length;
    const fours = round.filter(n => n == 4).length;
    if(threes && fours) {
        return ['This round is', threes, 'three-of-a-kinds and', fours, 'four-card-runs'];
    } else if(threes) {
        return ['This round is', threes, 'three-of-a-kinds'];
    } else {
        return ['This round is', fours, 'four-card-runs'];
    }
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