import { Card, Message, Presentable } from '@cards-ts/core';

function generateMessage(card: Card): Presentable[] {
    return [ card, 'was turned over' ];
}

/**
 * Class that denotes to a handler that a card was flipped over
 */
export class TurnUpMessage extends Message {

    public readonly type = 'turn-up-message';

    /**
     * @param card the card that was turned over
     */
    constructor(public readonly card: Card) {
        super(generateMessage(card));
    }
}
