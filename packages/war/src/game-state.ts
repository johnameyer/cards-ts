import { Card, GenericGameState } from "@cards-ts/core";
import { GameParams } from "./game-params";

export interface GameState extends GenericGameState<GameParams, GameState.State> {
    playedCards: Card[][];

    battleCount: number;
}

export namespace GameState {
    export enum State {
        START_GAME = 'START_GAME',

        START_BATTLE = 'START_BATTLE',

        START_FLIP = 'START_FLIP',
        WAIT_FOR_FLIP = 'WAIT_FOR_FLIP',
        HANDLE_FLIP = 'HANDLE_FLIP',

        END_BATTLE = 'END_BATTLE',

        START_WAR = 'START_WAR',
        END_WAR = 'END_WAR',

        END_GAME = 'END_GAME'
    }
}