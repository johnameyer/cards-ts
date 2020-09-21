import { AbstractGameState, Card } from "@cards-ts/core";
import { GameParams } from "./game-params";
import { HandlerData } from "./handler-data";

export class GameState extends AbstractGameState<GameParams, GameState.State, HandlerData> {
    pointsTaken!: number[];

    points: number[];

    dealer: number;

    leader!: number;

    currentTrick!: Card[];

    playedCard!: Card;

    whoseTurn!: number;

    pass!: number;

    passed!: Card[][];

    tricks: number;

    constructor(numPlayers: number, gameParams: GameParams, initialState: GameState.State) {
        super(numPlayers, gameParams, initialState);
        this.dealer = 0;
        this.pass = 1;
        this.tricks = 0;
        this.passed = [];

        this.points = new Array(this.numPlayers).fill(0);
    }

    transformToHandlerData(position: number) {
        const handlerData: HandlerData = {
            gameParams: {...this.gameParams},
            numPlayers: this.numPlayers,
            pointsTaken: this.pointsTaken,
            points: this.points,
            tricks: this.tricks,
            dealer: this.dealer,
            whoseTurn: this.whoseTurn,
            leader: this.leader,
            passed: this.passed[position],
            pass: this.pass,
            currentTrick: this.currentTrick,
            position,
            data: this.data[position],
            hand: this.hands[position]
        };
        return handlerData;
    }

    static fromObj(data: any) {
        // TODO
        return this;
    }
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