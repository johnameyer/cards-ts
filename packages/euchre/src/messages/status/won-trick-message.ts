import { Message, Presentable } from '@cards-ts/core';

function generateMessage(player: string): Presentable[] {
    return [player, 'took the trick'];
}

/**
 * Class that denotes to a handler that a player won the trick
 */
export class WonTrickMessage extends Message {
    public readonly type = 'won-trick-message';

    /**
     * @param players the player that won the trick
     */
    constructor(public readonly player: string) {
        super(generateMessage(player));
    }
}
