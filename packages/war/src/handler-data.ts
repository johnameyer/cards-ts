import { Card } from "@cards-ts/core";
import { GameParams } from "./game-params";

export interface HandlerData {
    gameParams: GameParams;

    numPlayers: number;

    playedCards: Card[][];

    data: unknown;
}