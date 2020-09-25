import { AbstractGameState, Card } from "@cards-ts/core";
import { number } from "yargs";
import { GameParams } from "./game-params";
import { HandlerData } from "./handler-data";

/*
    Here you define all the data that describes the state of the game as it is
 */

export class GameState extends AbstractGameState<GameParams, GameState.State, HandlerData> {
    pointsTaken!: number[];

    dealer: number;
// <% if(trickTaking){ %>
    leader!: number;
    
    points: number[];

    pointsTaken: number[];

    currentTrick!: Card[];

    tricks: number;
// <% } %>
    playedCard!: Card;

    whoseTurn!: number;

    constructor(numPlayers: number, gameParams: GameParams, initialState: GameState.State) {
        super(numPlayers, gameParams, initialState);
        this.dealer = 0;
        this.tricks = 0;

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

// <% if(trickTaking){ %>
        START_TRICK,
// <% } %>

        START_PLAY,
        WAIT_FOR_PLAY,
        HANDLE_PLAY,

// <% if(trickTaking){ %>
        END_TRICK,
// <% } %>

        END_ROUND,

        END_GAME
    }
}