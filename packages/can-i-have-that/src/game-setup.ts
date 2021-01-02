import { GenericGameSetup, Intermediary } from '@cards-ts/core';
import { GameParams } from "./game-params";

const FULL_GAME: (3 | 4)[][] = [ [3, 3], [3, 4], [4, 4], [3, 3, 3], [3, 3, 4], [3, 4, 4], [4, 4, 4] ];
const SHORT_GAME: (3 | 4)[][] = [ [3, 3], [3, 4], [4, 4] ];

export class GameSetup implements GenericGameSetup<GameParams> {
    getDefaultParams(): GameParams {
        return {
            rounds: FULL_GAME,
            // noDiscardLastRound: true
        };
    }

    async setupForIntermediary(host: Intermediary): Promise<GameParams> {
        const [_, resultsPromise] = host.form(
            {type: 'list', message: ['How long of a game?'], choices: [{name: 'Shortened game (3 rounds)', value: SHORT_GAME}, {name: 'Full game (7 rounds)', value: FULL_GAME}]},
            // {type: 'confirm', message: ['No discards on last round?']}
        );

        const results = await resultsPromise;

        const rounds = results[0] as (3 | 4)[][];
        // const noDiscardLastRound = results[1];

        return {
            rounds,
            // noDiscardLastRound
        };
    }
}