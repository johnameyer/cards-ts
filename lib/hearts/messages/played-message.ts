import { Message } from "../../games/message";
import { Card } from "../../cards/card";
import { Serializable } from "../../intermediary/presenter";

function generateMessage(player: string, card: Card): Serializable[] {
    return [player, 'played', card];
}

/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 */
export class PlayedMessage extends Message {
    /**
     * @param player the hand that is leading
     */
    constructor(public readonly player: string, public readonly card: Card) {
        super(generateMessage(player, card));
    }
}