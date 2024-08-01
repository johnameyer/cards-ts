import { buildMessage, cloneString } from '@cards-ts/core';

/**
 * Class that denotes that a player won the war
 */
export const WonWarMessage = buildMessage(
    'won-war-message',
    cloneString,
    player =>  [ player, 'won the war' ],
);