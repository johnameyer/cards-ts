import { isLeftBower } from './bower';
import { getComplementarySuit } from './suit-colors';
import { Card, Rank, Suit } from '@cards-ts/core';

export function followsTrick(trick: readonly (Card | undefined)[], trumpSuit: Suit, card: Card) {
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
        } 
        return card.suit === suit && card.suit !== getComplementarySuit(trumpSuit);
        
    } 
    if(card.suit === suit) {
        return true;
    }
    
    return false;
}
