import { Serializable } from '@cards-ts/core';

export interface GameParams {
    readonly [key: string]: Serializable;
    
    // TODO readonly limitWarToMinCards: boolean;
    readonly maxBattles: number;
}
