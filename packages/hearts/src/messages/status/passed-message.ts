import { Card, Message, Presentable } from '@cards-ts/core';

function generateMessage(cards: Card[], from: string): Presentable[] {
    return [ 'Received', cards, 'from', from ];
}

/**
 * Class that denotes to a handler that they have been passed certain cards
 */
export class PassedMessage extends Message {

    public readonly type = 'passed-message';

    /**
     * @param cards the cards being received
     * @param from the player the cards are from
     */
    constructor(public readonly cards: Card[], public readonly from: string) {
        super(generateMessage(cards, from));
    }
}
