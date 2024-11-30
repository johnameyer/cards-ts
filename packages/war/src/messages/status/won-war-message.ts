import { buildUnvalidatedMessage, props } from '@cards-ts/core';

/**
 * Class that denotes that a player won the war
 */
export const WonWarMessage = buildUnvalidatedMessage(
    'won-war-message',
    props<string>(),
    player =>  [ player, 'won the war' ],
);