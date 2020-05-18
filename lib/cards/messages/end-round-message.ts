import { Message } from "./message";

function generateMessage(players: readonly string[], scores: readonly number[]): string {
    return players.join('\t') + '\n' + scores.join('\t');
}

/**
 * Class denoting to handlers that the round has ended
 */
export class EndRoundMessage extends Message {
    /**
     * @param players the players' names
     * @param scores the cummulative scores
     */
    constructor(public readonly players: readonly string[], public readonly scores: readonly number[]) {
        super(generateMessage(players, scores));
    }
}
