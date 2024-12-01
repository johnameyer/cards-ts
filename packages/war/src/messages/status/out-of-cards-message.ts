import { buildUnvalidatedMessage, props } from '@cards-ts/core';

/**
 * Class that denotes that a player won
 */
export const OutOfCardsMessage = buildUnvalidatedMessage(
    'out-of-cards-message',
    props<string>(),
    player =>  [ player, 'is out of cards' ],
);