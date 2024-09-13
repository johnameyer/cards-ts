import { GameParams } from './game-params.js';
import { GenericGameSetup, Intermediary } from '@cards-ts/core';

export class GameSetup implements GenericGameSetup<GameParams> {
    getDefaultParams(): GameParams {
        return {
            maxScore: 100,
            numToPass: 3,
            quickEnd: true,
        };
    }

    async setupForIntermediary(host: Intermediary): Promise<GameParams> {
        const [_, resultsPromise] = host.form(
            { type: 'input', message: ['Score to play to? (default 100)'] },
            { type: 'input', message: ['Number of cards to pass? (default 3)'] },
            { type: 'confirm', message: ['End a round quickly if no points are remaining?'] },
        );

        const results = await resultsPromise;

        const maxScore = Number(results[0]) || 100;
        const numToPass = Number(results[1]) || 3;
        const quickEnd = results[2];

        return {
            maxScore,
            numToPass,
            quickEnd,
        };
    }

    verifyParams(params: GameParams) {
        const errors: { maxScore?: string; numToPass?: string; quickEnd?: string } = {};
        try {
            if (params.quickEnd !== true && params.quickEnd !== false) {
                throw new Error();
            }
        } catch (e) {
            errors.quickEnd = 'Quick-end must be a boolean.';
        }
        try {
            if (!Number(params.maxScore) || Number(params.maxScore) <= 0) {
                throw new Error();
            }
        } catch (e) {
            errors.maxScore = 'Max score must be a number greater than 0';
        }
        try {
            if (!Number(params.numToPass) || Number(params.numToPass) < 0 || Number(params.numToPass) > 4) {
                throw new Error();
            }
        } catch (e) {
            errors.numToPass = 'Number to pass must be between 0 and 4.';
        }
        return errors;
    }

    getYargs() {
        return {
            quickEnd: { description: 'End a round quickly if no points are remaining', type: 'boolean', default: true },
            maxScore: { description: 'Score to play to', type: 'number', default: 100 },
            numberToPass: { description: 'Number of cards to pass', type: 'number', default: 3 },
        } satisfies { [key: string]: import('yargs').Options };
    }

    setupForYargs(params: any): GameParams {
        return {
            quickEnd: !!params.quickEnd,
            maxScore: Number(params.maxScore),
            numToPass: Number(params.numberToPass),
        };
    }
}
