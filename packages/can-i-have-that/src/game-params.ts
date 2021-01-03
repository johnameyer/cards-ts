/**
 * Class that encapsulates the settings for an individual game
 */
export interface GameParams {
    /**
     * The rounds that this game should use
     */
    readonly rounds: (3 | 4)[][];

    /**
     * Whether the last round should allow discards
     */
    // TODO public readonly noDiscardLastRound: boolean;
}