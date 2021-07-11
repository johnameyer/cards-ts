import { Card, Rank, Suit } from '@cards-ts/core';
import { isLeftBower } from './bower';
import { getComplementarySuit } from './suit-colors';

export function followsTrick(trick: (Card | undefined)[], trumpSuit: Suit, card: Card) {
    const first = trick.find(c => c);
    return followsSuit(first && isLeftBower(first, trumpSuit) ? trumpSuit : first?.suit, trumpSuit, card);
}

function followsSuit(suit: Suit | undefined, trumpSuit: Suit, card: Card) {
    if(!suit) {
        return true;
    }
    if(card.rank === Rank.JACK) {
        if(suit === trumpSuit) {
            return card.suit === suit || card.suit === getComplementarySuit(suit);
        } else {
            return card.suit === suit && card.suit !== getComplementarySuit(trumpSuit);
        }
    } else {
        if(card.suit === suit) {
            return true;
        }
    }
    return false;
}