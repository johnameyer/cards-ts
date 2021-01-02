import { GenericGameSetup, Intermediary } from '@cards-ts/core';
import { GameParams } from "./game-params";

export class GameSetup implements GenericGameSetup<GameParams> {
    getDefaultParams(): GameParams {
        return  {
            // TODO limitWarToMinCards: true
            maxBattles: 200
        };
    }
    
    async setupForIntermediary(host: Intermediary): Promise<GameParams> {
        const [_, resultsPromise] = host.form(
            {type: 'input', message: ['How many battles before declaring a stalemate? (default 200)']},
        );

        const results = await resultsPromise;

        const maxBattles = Number(results[0]) || 200;

        return {
            maxBattles
        };
    }
}