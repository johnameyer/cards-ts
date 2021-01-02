import { GenericGameSetup, Intermediary } from '@cards-ts/core';
import { GameParams } from "./game-params";

export class GameSetup implements GenericGameSetup<GameParams> {
    getDefaultParams(): GameParams {
        return {
            maxScore: 100,
            numToPass: 3,
            quickEnd: true
        };
    }
    
    async setupForIntermediary(host: Intermediary): Promise<GameParams> {
        const [_, resultsPromise] = host.form(
            {type: 'input', message: ['Score to play to? (default 100)']},
            {type: 'input', message: ['Number of cards to pass? (default 3)']},
            {type: 'confirm', message: ['End the round when all valued cards are played?']},
        );

        const results = await resultsPromise;

        const maxScore = Number(results[0]) || 100;
        const numToPass = Number(results[1]) || 3;
        const quickEnd = results[2];

        return {
            maxScore,
            numToPass,
            quickEnd
        };
    }
}