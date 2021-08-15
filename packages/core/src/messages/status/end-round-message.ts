import { Presentable } from '../../intermediary/presentable';
import { Message } from '../message';

function generateMessage(players: readonly string[], scores: readonly number[]): Presentable[] {
    const arr: string[] = [];
    for(let i = 0; i < players.length; i++) {
        arr[i] = players[i] + ': ' + scores[i];
    }
    return arr;
}

/**
 * Class denoting to handlers that the round has ended
 * @category Message
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
