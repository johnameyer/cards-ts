import { Suit } from '@cards-ts/core';

export function getComplementarySuit(suit: Suit): Suit {
    return {
        [Suit.HEARTS.letter]: Suit.DIAMONDS,
        [Suit.DIAMONDS.letter]: Suit.HEARTS,
        [Suit.CLUBS.letter]: Suit.SPADES,
        [Suit.SPADES.letter]: Suit.CLUBS,
    }[suit.letter];
}
