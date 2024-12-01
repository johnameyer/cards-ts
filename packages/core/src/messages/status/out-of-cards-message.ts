import { cloneString } from '../cloners.js';
import { buildValidatedMessage, props } from '../message.js';

/**
 * Designates that a player ran out of cards
 * @category Message
 * @class
 */
export const OutOfCardsMessage = buildValidatedMessage(
    'outOfCards',
    props<
    /** the player who is out of cards */
    string
    >(),
    cloneString,
    name => [ name, 'is out of cards' ]
);
