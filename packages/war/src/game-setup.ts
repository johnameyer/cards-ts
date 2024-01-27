import { GenericGameSetup, Intermediary } from '@cards-ts/core';
import { GameParams } from './game-params.js';

export class GameSetup implements GenericGameSetup<GameParams> {
    getDefaultParams(): GameParams {
        return {
            // TODO limitWarToMinCards: true
            maxBattles: 200,
        };
    }
    
    async setupForIntermediary(host: Intermediary): Promise<GameParams> {
        const [ _, resultsPromise ] = host.form(
            { type: 'input', message: [ 'How many battles before declaring a stalemate? (default 200)' ] },
        );

        const results = await resultsPromise;

        const maxBattles = Number(results[0]) || 200;

        return {
            maxBattles,
        };
    }

    
    verifyParams(params: GameParams): { readonly maxBattles?: string; } {
        const errors: { maxBattles?: string | undefined; } = {};
        try {
            if(!Number(params.maxBattles) || Number(params.maxBattles) <= 0) {
                throw new Error();
            }
        } catch (e) {
            errors.maxBattles = 'Max battles must be an positive number.';
        }
        return errors;
    }

    getYargs(): {[key: string]: import('yargs').Options} {
        return {
            maxBattles: { alias: 'n', description: 'How many battles before declaring a stalemate', type: 'number', default: 200 },
        };
    }

    setupForYargs(params: any): GameParams {
        return {
            maxBattles: Number(params.maxBattles),
        };
    }
}
