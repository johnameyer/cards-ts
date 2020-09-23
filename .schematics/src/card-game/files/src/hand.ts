import { Handler } from "./handler";
import { GameParams } from "./game-params";
import { HandlerData } from "./handler-data";
import { GameState } from "./game-state";
import { Card, Suit, Rank, AbstractHand } from "@cards-ts/core";

const QS = new Card(Suit.SPADES, Rank.QUEEN);

/*
    This class is a wrapper around the handlers: transforming game state and handling errors.
 */

export class Hand extends AbstractHand<GameParams, GameState.State, HandlerData, Handler, GameState> {
    constructor(private handler: Handler, private position: number) {
        /*
            You can leave off the position field for games without positions.
         */
        super();
    }
    
    async action(game: GameState): Promise<unknown> {
        try {
            const [result, data] = await this.handler.action(game.transformToHandlerData(this.position));

            game.data[this.position] = data ? data : {};

            return result;
        } catch (e) {
            console.error('Handler threw error', e);
        }

        // fallback
        return undefined;
    }
}