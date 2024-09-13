import { buildMessage, cloneString, Message, Presentable } from '@cards-ts/core';

/**
 * Class that denotes that a player won the battle
 */
export const WonBattleMessage = buildMessage(
    'won-battle-message',
    cloneString,
    player =>  [ player, 'won the battle' ],
);