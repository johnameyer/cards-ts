import { Message, Suit } from "@cards-ts/core";
import { Serializable } from "@cards-ts/core";

function generateMessage(trump: Suit): Serializable[] {
    return [trump, 'is trump'];
}

/**
 * Class that denotes to a handler a card has been declared trump
 */
export class TrumpMessage extends Message {

    public readonly type = 'trump-message';

    /**
     * @param trump the trump suit
     */
    constructor(public readonly trump: Suit) {
        super(generateMessage(trump));
    }
}