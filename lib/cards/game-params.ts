export class GameParams {
    public readonly rounds: (3 | 4)[][];

    constructor({rounds}: {rounds: (3 | 4)[][]}) {
        this.rounds = rounds;
    }
}

export const defaultParams = new GameParams({
    rounds: [ [3, 3], [3, 4], [4, 4], [3, 3, 3], [3, 3, 4], [3, 4, 4], [4, 4, 4] ]
});