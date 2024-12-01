import { buildUnvalidatedMessage, props } from '@cards-ts/core';

/**
 * Class that denotes that a player won the battle
 */
export const WonBattleMessage = buildUnvalidatedMessage(
    'won-battle-message',
    props<string>(),
    player =>  [ player, 'won the battle' ],
);