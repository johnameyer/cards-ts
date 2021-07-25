import { Card, Message, Presentable } from "@cards-ts/core";

function generateMessage(player: string, card: Card): Presentable[] {
    return [player, 'played', card];
}

/**
 * Class that denotes to a handler that a card has been played
 */
export class PlayedMessage extends Message {

    public readonly type = 'played-message';

    /**
     * @param player the hand that is playing the card
     * @param card the card being played
     */
    constructor(public readonly player: string, public readonly card: Card) {
        super(generateMessage(player, card));
    }
}