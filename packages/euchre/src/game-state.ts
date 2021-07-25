import { Card, GenericGameState, Suit } from "@cards-ts/core";
import { GameParams } from "./game-params";

export interface GameState extends GenericGameState<GameParams, GameState.State> {
    tricksTaken: number[];

    points: number[];

    dealer: number;

    leader: number;

    currentTrick: (Card | undefined)[];

    playedCard: Card;

    whoseTurn: number;

    flippedCard: Card;

    currentTrump: Suit;

    bidder: number | undefined;

    goingAlone: number | undefined;

    tricks: number;
}

export namespace GameState {
    export enum State {
        START_GAME = 'START_GAME',

        START_ROUND = 'START_ROUND',

        START_ORDERING_UP = 'START_ORDERING_UP',
        WAIT_FOR_ORDER_UP = 'WAIT_FOR_ORDER_UP',
        HANDLE_ORDER_UP = 'HANDLE_ORDER_UP',

        START_TRUMP_NAMING = 'START_TRUMP_NAMING',
        WAIT_FOR_TRUMP_NAMING = 'WAIT_FOR_TRUMP_NAMING',
        HANDLE_TRUMP_NAMING = 'HANDLE_TRUMP_NAMING',

        WAIT_FOR_DEALER_DISCARD = 'WAIT_FOR_DEALER_DISCARD',
        HANDLE_DEALER_DISCARD = 'HANDLE_DEALER_DISCARD',

        START_TRICK = 'START_TRICK',

        START_PLAY = 'START_PLAY',
        WAIT_FOR_PLAY = 'WAIT_FOR_PLAY',
        HANDLE_PLAY = 'HANDLE_PLAY',
        END_PLAY = 'END_PLAY',

        END_TRICK = 'END_TRICK',

        END_ROUND = 'END_ROUND',

        END_GAME = 'END_GAME'
    }
}