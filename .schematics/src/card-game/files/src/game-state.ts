import { AbstractGameState, Card } from "@cards-ts/core";
import { GameParams } from "./game-params";
import { HandlerData } from "./handler-data";

/*
    Here you define all the data that describes the state of the game as it is
 */

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
        /*
            Here you transform the game data to the handler version
         */
        return this;
    }
}

/*
    Here you set up the states of the game state machine.
 */
export namespace GameState {
    export enum State {
        START_GAME,

        START_ROUND,

        START_TRICK,

        END_TRICK,

        END_ROUND,

        END_GAME
    }
}