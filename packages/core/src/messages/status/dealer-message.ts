import { cloneString } from '../cloners.js';
import { buildValidatedMessage, props } from '../message.js';

/**
 * Designates that a player is dealer
 * @category Message
 * @class
 * @param payload The dealer
 */
export const DealerMessage = buildValidatedMessage(
    'dealer',
    props<string>(),
    cloneString,
    name => [ name, 'is dealer' ]
);