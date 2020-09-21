import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(players: readonly string[], scores: readonly number[]): Serializable[] {
    const arr: string[] = [];
    for(let i = 0; i < players.length; i++) {
        arr[i] = players[i] + ': ' + scores[i];
    }
    return arr;
}

/**
 * Class denoting to handlers that the round has ended
 */
export class EndRoundMessage extends Message {
    /**
     * @param players the players' names
     * @param scores the culmulative scores
     */
    constructor(public readonly players: readonly string[], public readonly scores: readonly number[]) {
        super(generateMessage(players, scores));
    }
}
