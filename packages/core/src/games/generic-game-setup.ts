import { Intermediary } from "../intermediary/intermediary";

type ErrorForKey<T> = {
    readonly [Key in keyof T]?: string
}

export interface GenericGameSetup<GameParams> {
    getDefaultParams(): GameParams;

    verifyParams(params: GameParams): ErrorForKey<GameParams>;

    getYargs(): {[alias: string]: any};

    setupForYargs(params: any): GameParams;

    setupForIntermediary(host: Intermediary): Promise<GameParams>;
}