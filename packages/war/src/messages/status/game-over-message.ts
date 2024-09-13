import { Message, Presentable } from '@cards-ts/core';

function generateMessage(player: string): Presentable[] {
    return [player, 'won'];
}

/**
 * Class that denotes that a player won
 */
export class GameOverMessage extends Message {
    public readonly type = 'game-over-message';

    /**
     * @param player the hand that won
     */
    constructor(public readonly player: string) {
        super(generateMessage(player));
    }
}
