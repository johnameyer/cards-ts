import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(player: string): Serializable[] {
    return [player, 'won the war'];
}

/**
 * Class that denotes that a player won the war
 */
export class WonWarMessage extends Message {

    public readonly type = 'won-war-message';

    /**
     * @param player the hand that won
     */
    constructor(public readonly player: string) {
        super(generateMessage(player));
    }
}