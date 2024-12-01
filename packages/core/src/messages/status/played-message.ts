import { Card } from '../../cards/card.js';
import { Meld } from '../../cards/meld.js';
import { cloneArray, cloneCard, cloneMeld, cloneObject, cloneString } from '../cloners.js';
import { buildValidatedMessage, props } from '../message.js';

/**
 * A class designating that a player put down cards on the table
 * @category Message
 * @class
 */
export const PlayedOnMeldMessage = buildValidatedMessage(
    'playedOnMeld',
    props<{
        /** the cards that were played */
        cards: Card[],
        /** the player playing the cards */
        player: string,
        /** the run the cards were played on */
        meld: Meld,
    }>(),
    cloneObject({
        cards: cloneArray(cloneCard),
        player: cloneString,
        meld: cloneMeld
    }),
    ({cards, meld, player}) => {
        if(cards.length === meld.cards.length) {
            return [ player, 'played', meld.toString() ];
        }
        return [ player, 'played', cards, 'on', meld.toString() ];
    }
);
