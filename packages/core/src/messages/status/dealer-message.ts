import { cloneString } from '../cloners.js';
import { buildMessage } from '../message.js';

/**
 * Designates that a player is dealer
 * @category Message
 */
export const DealerMessage = buildMessage(
    'dealer',
    cloneString,
    name => [ name, 'is dealer' ]
);