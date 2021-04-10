import { Card } from '@cards-ts/core';
import { Suit } from '@cards-ts/core';
import { Rank } from '@cards-ts/core';

export function compare(one: Card, two: Card): number {
    if (one.suit !== two.suit) {
        return Suit.compare(one.suit, two.suit);
    }
    return Rank.compare(one.rank, two.rank);
}
