import { isLeftBower, isRightBower } from './bower.js';
import { Card, Rank, Suit } from '@cards-ts/core';

export function winningPlay(currentTrick: readonly (Card | undefined)[], currentTrump: Suit) {
    const first = currentTrick.findIndex(card => card);
    const leadingSuit = (currentTrick[first] as Card).suit;
    let winningPlayer = first;
    // TODO clean up and test
    if(isRightBower(currentTrick[first] as Card, currentTrump)) {
        // Played right, cannot be beat
        return first;
    }
    let trumpPlayed = (currentTrick[first] as Card).suit === currentTrump || isLeftBower(currentTrick[first] as Card, currentTrump);
    for(let i = first + 1; i < currentTrick.length; i++) {
        const card = currentTrick[i];
        if(!card) {
            continue;
        }
        if(card.suit === currentTrump) {
            if(card.rank === Rank.JACK) {
                // Played right, cannot be beat
                winningPlayer = i;
                trumpPlayed = true;
                break;
            }
            if(!trumpPlayed || card.rank.order > (currentTrick[winningPlayer] as Card).rank.order && !isLeftBower(currentTrick[winningPlayer] as Card, currentTrump)) {
                // Played first trump or better trump than previous (excluding bowers)
                winningPlayer = i;
                trumpPlayed = true;
            }
        } else if(isLeftBower(card, currentTrump)) {
            // played left
            trumpPlayed = true;
            winningPlayer = i;
        } else if(!trumpPlayed && card.suit === leadingSuit) {
            if(card.rank.order > (currentTrick[winningPlayer] as Card).rank.order) {
                // played better card
                winningPlayer = i;
            }
        }
    }
    return winningPlayer;
}
