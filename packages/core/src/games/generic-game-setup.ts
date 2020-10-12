import { Intermediary } from "../intermediary/intermediary";

export interface GenericGameSetup<GameParams> {
    getDefaultParams(): GameParams;

    setupForIntermediary(host: Intermediary): Promise<GameParams>;
}