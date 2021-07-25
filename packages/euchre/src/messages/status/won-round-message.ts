import { Message, Presentable } from "@cards-ts/core";

function generateMessage(players: string[], points: number): Presentable[] {
    return [players, 'won', points, 'points'];
}

/**
 * Class that denotes to a handler that a team won the round
 */
export class WonRoundMessage extends Message {

    public readonly type = 'won-round-message';

    /**
     * @param players the players that won the round
     */
    constructor(public readonly players: string[], points: number) {
        super(generateMessage(players, points));
    }
}