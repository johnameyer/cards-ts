import { buildMessage, cloneString, Message, Presentable } from '@cards-ts/core';

/**
 * Class that denotes that a player won
 */
export const GameOverMessage = buildMessage(
    'game-over-message',
    cloneString,
    player =>  [ player, 'won' ],
);