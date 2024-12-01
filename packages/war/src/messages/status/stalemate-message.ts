import { buildEmptyMessage } from '@cards-ts/core';

/**
 * Class that denotes that a player won
 */
export const StalemateMessage = buildEmptyMessage(
    'stalemate-message',
    () =>  [ 'Game went over the max number of battles' ],
);