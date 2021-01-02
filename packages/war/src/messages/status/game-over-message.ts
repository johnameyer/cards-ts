import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(player: string): Serializable[] {
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