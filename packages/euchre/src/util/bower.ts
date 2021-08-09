import { Card, Rank, Suit } from '@cards-ts/core';
import { getComplementarySuit } from './suit-colors';

export function isLeftBower(card: Card, trump: Suit) {
    return card.rank === Rank.JACK && card.suit === getComplementarySuit(trump);
}

export function isRightBower(card: Card, trump: Suit) {
    return card.rank === Rank.JACK && card.suit === trump;
}
