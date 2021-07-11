import { Card, Suit } from "@cards-ts/core";
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

    flippedCard: Card;

    currentTrump: Suit;

    currentTrick: (Card | undefined)[];

    position: number;

    data: unknown;
}