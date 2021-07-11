import { GameParams } from "../game-params";

export function getTeams(params: GameParams) {
    return [[0, 2], [1, 3]];
}
export function getTeamFor(position: number, params: GameParams) {
    return position % 2;
}
