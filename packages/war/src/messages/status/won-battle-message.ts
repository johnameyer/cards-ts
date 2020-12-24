import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(player: string): Serializable[] {
    return [player, 'won the battle'];
}

/**
 * Class that denotes that a player won the battle
 */
export class WonBattleMessage extends Message {

    public readonly type = 'won-battle-message';

    /**
     * @param player the hand that won
     */
    constructor(public readonly player: string) {
        super(generateMessage(player));
    }
}