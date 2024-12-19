import { Card, Suit } from '@cards-ts/core';

export function valueOfCard(card: Card): number {
    if(card.equals(Card.fromString('QS'))) {
        return 13; // NUM OF HEARTS
    }
    if(card.suit === Suit.HEARTS) {
        return 1;
    }
    return 0;
}
