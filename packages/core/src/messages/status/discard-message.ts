import { Card } from '../../cards/index.js';
import { cloneCard, cloneObject, cloneOptional, cloneString } from '../cloners.js';
import { buildValidatedMessage, props } from '../message.js';

/**
 * Class that denotes to a handler that a player has discarded a card
 * @category Message
 * @class
 */
export const DiscardMessage = buildValidatedMessage(
    'discard',
    // TODO consider how to represent the player better for programmatic handlers' tracking
    // TODO should player even exist on these?
    props<{
        /** The player that discarded the card */
        player?: string,
        /** The card that was discarded */
        card: Card,
    }>(),
    cloneObject({     
        player: cloneOptional(cloneString),
        card: cloneCard,
    }),
    ({player, card}) => {
        if(player) {
            return [ player, 'discarded', card ];
        } 
        return [ 'First card is', card ];
    },
);
