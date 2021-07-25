import { Serializable } from '@cards-ts/core';

/**
 * Class that encapsulates the settings for an individual game
 */
export interface GameParams {
    readonly [key: string]: Serializable;
    /**
     * The rounds that this game should use
     */
    readonly rounds: (3 | 4)[][];

    /**
     * Whether the last round should allow discards
     */
    // TODO public readonly noDiscardLastRound: boolean;
}