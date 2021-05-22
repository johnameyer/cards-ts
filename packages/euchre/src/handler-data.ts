import { Card } from "@cards-ts/core";
import { GameParams } from "./game-params";

export interface HandlerData {
    gameParams: GameParams;

    numPlayers: number;

    hand: Card[];

    pointsTaken: number[];

    points: number[];

    tricks: number;

    dealer: number;

    whoseTurn: number;

    leader: number;

    pass: number

    currentTrick: Card[];

    passed: Card[];

    position: number;

    data: unknown;
}