import { AbstractHandlerData } from "../games/abstract-handler-data";
import { Card } from "../cards/card";
import { GameParams } from "./game-params";

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