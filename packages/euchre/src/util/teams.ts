import { GameParams } from "../game-params";

export function getTeams(_params: GameParams) {
    return [[0, 2], [1, 3]];
}
export function getTeamFor(position: number, params: GameParams) {
    return getTeams(params).find(team => team.includes(position)) as number[];
}
