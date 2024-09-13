import { Message, Presentable, Suit } from '@cards-ts/core';

function generateMessage(leader: string, suit: Suit): Presentable[] {
    return [leader, 'selected', suit, 'as next trump'];
}

/**
 * Class that denotes to a handler that a card has been named trump
 */
export class NameTrumpMessage extends Message {
    public readonly type = 'name-trump-message';

    /**
     * @param player the hand that is leading
     */
    constructor(public readonly player: string, public readonly suit: Suit) {
        super(generateMessage(player, suit));
    }
}
