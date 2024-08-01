import { buildMessage, cloneString } from '@cards-ts/core';

/**
 * Class that denotes that a player won
 */
export const OutOfCardsMessage = buildMessage(
    'out-of-cards-message',
    cloneString,
    player =>  [ player, 'is out of cards' ],
);