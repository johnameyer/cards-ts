import { GameState } from "./game-state";
import { GameParams } from "./game-params";
import { HandlerData } from "./handler-data";
import { Handler } from "./handler";
import { Hand } from "./hand";
import { DealOutMessage } from "./messages/deal-out-message";
import { PassedMessage } from "./messages/passed-message";
import { LeadsMessage } from "./messages/leads-message";
import { PlayedMessage } from "./messages/played-message";
import { EndRoundMessage } from "./messages/end-round-message";
import { ScoredMessage } from "./messages/scored-message";
import { ShotTheMoonMessage } from "./messages/shot-the-moon-message";
import { NoPassingMessage } from "./messages/no-passing-message";
import { PassingMessage } from "./messages/passing-message";
import { AbstractGameDriver, Card, Deck, Rank, Suit } from '@cards-ts/core';

function valueOfCard(card: Card): number {
    if(card.equals(Card.fromString('QS'))) {
        return 13; // NUM OF HEARTS
    }
    if(card.suit === Suit.HEARTS) {
        return 1;
    }
    return 0;
}

export class GameDriver extends AbstractGameDriver<HandlerData, Handler, Hand, GameParams, GameState.State, GameState> {
    public async iterate(): Promise<void> {
        switch(this.gameState.state) {
            case GameState.State.START_GAME:
                this.startGame();
                break;

            case GameState.State.START_ROUND:
                this.startRound();
                break;

            case GameState.State.START_TRICK:
                this.startTrick();
                break;

            case GameState.State.START_PLAY:
                this.startPlay();
                break;

            case GameState.State.WAIT_FOR_PLAY:
                await this.waitForPlay();
                break;

            case GameState.State.HANDLE_PLAY:
                this.handlePlay();
                break;

            case GameState.State.END_TRICK:
                this.endTrick();
                break;

            case GameState.State.END_ROUND:
                this.endRound();
                break;

            case GameState.State.END_GAME:
                this.endGame();
                break;
        }
    }

    startGame() {
        this.gameState.state = GameState.State.START_ROUND;
    }

    startRound() {
        this.gameState.state = GameState.State.START_TRICK;
    }

    startTrick() {
        this.messageAll(new LeadsMessage(this.gameState.names[this.gameState.leader]));
        this.gameState.currentTrick = [];
        this.gameState.whoseTurn = this.gameState.leader;

        this.gameState.state = GameState.State.START_PLAY;
    }

    startPlay() {
        this.gameState.state = GameState.State.WAIT_FOR_PLAY;
    }

    async waitForPlay() {
        this.waitingOthers(this.players, this.players[this.gameState.whoseTurn]);
        this.gameState.playedCard = await this.players[this.gameState.whoseTurn].play(this.gameState);
        this.waitingOthers(this.players);
        
        this.gameState.state = GameState.State.HANDLE_PLAY;
    }

    handlePlay() {
        const { whoseTurn, playedCard, hands} = this.gameState;
        this.gameState.currentTrick.push(playedCard);
        const index = hands[whoseTurn].findIndex(card => card === playedCard);
        if(index == -1) {
            throw new Error('Nonexistent card?');
        }
        hands[whoseTurn].splice(index, 1);
        this.messageOthers(whoseTurn, new PlayedMessage(this.gameState.names[whoseTurn], playedCard))

        if(this.gameState.currentTrick.length === this.gameState.numPlayers) {
            this.gameState.state = GameState.State.END_TRICK;
        } else {
            this.gameState.whoseTurn = (whoseTurn + 1) % this.gameState.numPlayers;
            this.gameState.state = GameState.State.START_PLAY;
        }
    }

    endTrick() {
        this.gameState.tricks++;

        const leadingSuit = this.gameState.currentTrick[0].suit;
        let winningPlayer = 0;
        for(let i = 1; i < this.gameState.numPlayers; i++) {
            const card = this.gameState.currentTrick[i];
            if(card.suit === leadingSuit) {
                if(card.rank.order > this.gameState.currentTrick[winningPlayer].rank.order) {
                    winningPlayer = i;
                }
            }
        }

        this.gameState.pointsTaken[(winningPlayer + this.gameState.leader) % this.gameState.numPlayers] += this.gameState.currentTrick.map(valueOfCard).reduce((a, b) => a + b, 0);
        this.gameState.leader = (winningPlayer + this.gameState.leader) % this.gameState.numPlayers;

        if(this.gameState.gameParams.quickEnd && !this.gameState.hands.flatMap(hand => hand).map(valueOfCard).some(value => value >= 0)) {
            // might be nice to have a message here if round ends early
            this.gameState.state = GameState.State.END_ROUND;
        } else if(this.gameState.hands.every(hand => hand.length === 0)) {
            this.gameState.state = GameState.State.END_ROUND;
        } else {
            this.gameState.state = GameState.State.START_TRICK;
        }
    }

    endRound() {
        this.gameState.tricks = 0;

        for(let player = 0; player < this.gameState.numPlayers; player++) {
            const newPoints = this.gameState.pointsTaken[player];
            this.gameState.points[player] += newPoints;
            this.message(player, new ScoredMessage(newPoints));
        }
        
        this.messageAll(new EndRoundMessage(this.gameState.names, this.gameState.points));
        
        if(this.gameState.points.some(points => points >= this.gameState.gameParams.maxScore)) {
            this.gameState.state = GameState.State.END_GAME;
        } else {
            this.gameState.state = GameState.State.START_ROUND;
        }   
    }

    endGame() {
        this.gameState.completed = true;
    }

}