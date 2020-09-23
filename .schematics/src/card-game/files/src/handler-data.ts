import { AbstractHandlerData, Card } from "@cards-ts/core";
import { GameParams } from "./game-params";

/*
    Here you can define the data that is passed on to the handlers that they use to make a decision.
 */

export interface HandlerData extends AbstractHandlerData {
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