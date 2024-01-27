import { Intermediary } from '../intermediary/intermediary.js';

/**
 * Represents possible error messages for the subset of params in T
 */
type ErrorForKey<T> = {
    readonly [Key in keyof T]?: string
}

/**
 * Gives a nicer way to setup a game
 * @typeParam GameParams the params this sets up for
 */
export interface GenericGameSetup<GameParams> {
    /**
     * Get the default way this game runs
     */
    getDefaultParams(): GameParams;

    /**
     * Checks if the parameters are valid
     * @param params the parameters to check
     */
    verifyParams(params: GameParams): ErrorForKey<GameParams>;

    /**
     * Get the parameters as a dict to pass to yargs.options
     */
    getYargs(): {[alias: string]: any};

    /**
     * Transforms the inputs from yargs into the parameters
     * @param params the vargs from yargs
     */
    setupForYargs(params: any): GameParams;

    /**
     * Set up the game with a series of questions
     * @param host the intermediary to set up on
     */
    setupForIntermediary(host: Intermediary): Promise<GameParams>;
}
