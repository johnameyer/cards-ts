import { AbstractHand } from "../games/abstract-hand";
import { Handler } from "./handler";
import { GameParams } from "./game-params";
import { HandlerData } from "./handler-data";
import { GameState } from "./game-state";
import { Card } from "../cards/card";
import { Suit } from "../cards/suit";
import { Rank } from "../cards/rank";

const QS = new Card(Suit.SPADES, Rank.QUEEN);

export class Hand extends AbstractHand<GameParams, GameState.State, HandlerData, Handler, GameState> {
    async pass(game: GameState): Promise<Card[]> {
        try {
            const [cards, data] = await this.handler.pass(game.transformToHandlerData(this.position));

            if(cards.length !== game.gameParams.numToPass) {
                throw new Error('Wrong number of cards passed');
            }

            game.data[this.position] = data ? data : {};

            return cards;
        } catch (e) {
            console.error('Handler threw error', e);
        }
        // fallback
        return game.hands[this.position].slice(0, game.gameParams.numToPass);
    }
    
    async turn(game: GameState): Promise<Card> {
        try {
            const [card, data] = await this.handler.turn(game.transformToHandlerData(this.position));

            if(game.tricks === 0 && (card.suit === Suit.HEARTS || card.equals(QS))) {
                throw new Error('Cannot give points on the first round');
            }

            if(game.currentTrick[0] === undefined && card.suit === Suit.HEARTS && game.pointsTaken.every(point => point === 0)) {
                throw new Error('Blood has not been shed yet');
            }

            if(game.currentTrick[0]?.suit && card.suit !== game.currentTrick[0].suit && game.hands[this.position].some(card => card.suit === game.currentTrick[0]?.suit)) {
                throw new Error('Must follow suit if possible');
            }

            game.data[this.position] = data ? data : {};

            return card;
        } catch (e) {
            console.error('Handler threw error', e);
        }
        // fallback
        return game.hands[this.position].filter(card => card.suit === game.currentTrick[0]?.suit)[0] || game.hands[this.position].filter(card => card.suit !== Suit.HEARTS)[0] || game.hands[this.position][0];
    }
}