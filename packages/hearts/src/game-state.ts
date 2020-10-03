import { Card, GenericGameState } from "@cards-ts/core";
import { GameParams } from "./game-params";

export interface GameState extends GenericGameState<GameParams, GameState.State> {
    pointsTaken: number[];

    points: number[];

    dealer: number;

    leader: number;

    currentTrick: Card[];

    playedCard: Card;

    whoseTurn: number;

    pass: number;

    passed: Card[][];

    tricks: number;
}

export namespace GameState {
    export enum State {
        START_GAME,

        START_ROUND,

        START_PASS,
        WAIT_FOR_PASS,
        HANDLE_PASS,

        START_FIRST_TRICK,

        START_TRICK,

        START_PLAY,
        WAIT_FOR_PLAY,
        HANDLE_PLAY,

        END_TRICK,

        END_ROUND,

        END_GAME
    }
}