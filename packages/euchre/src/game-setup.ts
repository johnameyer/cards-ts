import { GameParams } from './game-params.js';
import { GenericGameSetup, Intermediary } from '@cards-ts/core';

export class GameSetup implements GenericGameSetup<GameParams> {
    getDefaultParams(): GameParams {
        return {
            maxScore: 10,
        };
    }
    
    async setupForIntermediary(host: Intermediary): Promise<GameParams> {
        const [ _, resultsPromise ] = host.form(
            { type: 'input', message: [ 'Score to play to? (default 10)' ] },
        );

        const results = await resultsPromise;

        const maxScore = Number(results[0]) || 10;

        return {
            maxScore,
        };
    }

    verifyParams(params: GameParams) {
        const errors: { maxScore?: string; } = {};
        try {
            if(!Number(params.maxScore) || Number(params.maxScore) <= 0) {
                throw new Error();
            }
        } catch (e) {
            errors.maxScore = 'Max score must be a number greater than 0';
        }
        return errors;
    }

    getYargs() {
        return {
            quickEnd: { description: 'End a round quickly if no points are remaining', type: 'boolean', default: true },
            maxScore: { description: 'Score to play to', type: 'number', default: 10 },
        } satisfies {[key: string]: import('yargs').Options};
    }

    setupForYargs(params: any): GameParams {
        return {
            quickEnd: !!params.quickEnd,
            maxScore: Number(params.maxScore),
        };
    }
}
