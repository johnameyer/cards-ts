import { buildEmptyMessage, Message } from '../message.js';

/**
 * A class designating that the deck was reshuffled
 * @category Message
 * @class
 */
export const ReshuffleMessage = buildEmptyMessage(
    'reshuffle',
    () => [ 'The deck was reshuffled' ]
);
