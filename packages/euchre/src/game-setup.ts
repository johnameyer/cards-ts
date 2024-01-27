import { GenericGameSetup, Intermediary } from '@cards-ts/core';
import { GameParams } from './game-params.js';

export class GameSetup implements GenericGameSetup<GameParams> {
    getDefaultParams(): GameParams {
        return {
            maxScore: 10,
            quickEnd: true,
        };
    }
    
    async setupForIntermediary(host: Intermediary): Promise<GameParams> {
        const [ _, resultsPromise ] = host.form(
            { type: 'input', message: [ 'Score to play to? (default 10)' ] },
            { type: 'confirm', message: [ 'End a round quickly if no points are remaining?' ] },
        );

        const results = await resultsPromise;

        const maxScore = Number(results[0]) || 100;
        const quickEnd = results[1];

        return {
            maxScore,
            quickEnd,
        };
    }

    verifyParams(params: GameParams) {
        const errors: { maxScore?: string; numToPass?: string; quickEnd?: string; } = {};
        try {
            if(params.quickEnd !== true && params.quickEnd !== false) {
                throw new Error();
            }
        } catch (e) {
            errors.quickEnd = 'Quick-end must be a boolean.';
        }
        try {
            if(!Number(params.maxScore) || Number(params.maxScore) <= 0) {
                throw new Error();
            }
        } catch (e) {
            errors.maxScore = 'Max score must be a number greater than 0';
        }
        return errors;
    }

    getYargs(): {[key: string]: import('yargs').Options} {
        return {
            quickEnd: { description: 'End a round quickly if no points are remaining', type: 'boolean', default: true },
            maxScore: { description: 'Score to play to', type: 'number', default: 10 },
        };
    }

    setupForYargs(params: any): GameParams {
        return {
            quickEnd: !!params.quickEnd,
            maxScore: Number(params.maxScore),
        };
    }
}
