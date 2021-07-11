import { Message } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(player: string): Serializable[] {
    return [player, 'ordered up the card'];
}

/**
 * Class that denotes to a handler that a certain player ordered up the trump
 */
export class OrderUpMessage extends Message {

    public readonly type = 'order-up-message';

    /**
     * @param player the hand that ordered up the trump
     */
    constructor(public readonly player: string) {
        super(generateMessage(player));
    }
}