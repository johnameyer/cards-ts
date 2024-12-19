
/**
 * Standard states for the state machine with special purposes
 * @category Game Builder
 */
export const STANDARD_STATES = {
    /**
     * The state that every game begins with
     */
    START_GAME: 'START_GAME',

    /**
     * The state that every game ends with
     */
    END_GAME: 'END_GAME',
} as const;
