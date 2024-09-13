import { STANDARD_STATES } from '@cards-ts/core';

export const GameStates = {
    ...STANDARD_STATES,

    START_BATTLE: 'START_BATTLE',

    START_FLIP: 'START_FLIP',
    WAIT_FOR_FLIP: 'WAIT_FOR_FLIP',
    HANDLE_FLIP: 'HANDLE_FLIP',

    END_BATTLE: 'END_BATTLE',

    START_WAR: 'START_WAR',
    END_WAR: 'END_WAR',
} as const;
