import { buildUnvalidatedMessage, props } from '@cards-ts/core';

/**
 * Class that denotes that a player won
 */
export const GameOverMessage = buildUnvalidatedMessage(
    'game-over-message',
    props<string>(),
    player =>  [ player, 'won' ],
);