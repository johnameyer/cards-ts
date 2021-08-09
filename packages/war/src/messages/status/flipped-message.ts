import { Card, Message, Presentable } from '@cards-ts/core';

function generateMessage(player: string, card: Card): Presentable[] {
    return [ player, 'flipped', card ];
}

/**
 * Class that denotes that a card has been flipped
 */
export class FlippedMessage extends Message {

    public readonly type = 'flipped-message';

    /**
     * @param player the hand that flipped
     * @param card the card that was flipped
     */
    constructor(public readonly player: string, public readonly card: Card) {
        super(generateMessage(player, card));
    }
}
