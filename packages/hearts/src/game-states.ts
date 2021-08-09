import { STANDARD_STATES } from '@cards-ts/core';

export const GameStates = {
    ...STANDARD_STATES,
    
    START_GAME: 'START_GAME',
    
    START_ROUND: 'START_ROUND',
    
    START_PASS: 'START_PASS',
    WAIT_FOR_PASS: 'WAIT_FOR_PASS',
    HANDLE_PASS: 'HANDLE_PASS',
    
    START_FIRST_TRICK: 'START_FIRST_TRICK',
    
    START_TRICK: 'START_TRICK',
    
    START_PLAY: 'START_PLAY',
    WAIT_FOR_PLAY: 'WAIT_FOR_PLAY',
    HANDLE_PLAY: 'HANDLE_PLAY',
    
    END_TRICK: 'END_TRICK',
    
    END_ROUND: 'END_ROUND',
    
    END_GAME: 'END_GAME',
} as const;
