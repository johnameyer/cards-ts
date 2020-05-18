/**
 * Class that encapsulates the settings for an individual game
 */
export class GameParams {
    /**
     * The rounds that this game should use
     */
    public readonly rounds: (3 | 4)[][];

    /**
     * Create the game params
     * @param rounds the rounds to use in this game
     */
    constructor({rounds}: {rounds: (3 | 4)[][]}) {
        this.rounds = rounds;
    }
}

/**
 * The default settings a game is played with
 */
export const defaultParams = new GameParams({
    rounds: [ [3, 3], [3, 4], [4, 4], [3, 3, 3], [3, 3, 4], [3, 4, 4], [4, 4, 4] ]
});