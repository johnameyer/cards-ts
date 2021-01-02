import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(player: string): Serializable[] {
    return [player, 'is out of cards'];
}

/**
 * Class that denotes that a player won
 */
export class OutOfCardsMessage extends Message {

    public readonly type = 'out-of-cards-message';

    /**
     * @param player the hand that is out of cards
     */
    constructor(public readonly player: string) {
        super(generateMessage(player));
    }
}