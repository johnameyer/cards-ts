import { AbstractHandlerData, Card } from "@cards-ts/core";
import { GameParams } from "./game-params";

/*
    Here you can define the data that is passed on to the handlers that they use to make a decision.
 */

export interface HandlerData extends AbstractHandlerData {
    gameParams: GameParams;

    numPlayers: number;

    hand: Card[];

    dealer: number;

    whoseTurn: number;

// <% if(trickTaking){ %>
    leader: number;
    
    tricks: number;

    pointsTaken: number[];

    points: number[];

    currentTrick: Card[];
// <% } %>

    position: number;

    data: unknown;
}