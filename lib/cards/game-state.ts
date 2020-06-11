import { Deck } from './deck';
import { GameParams } from './game-params';
import { Card } from './card';
import { Run } from './run';
import { HandlerData, HandlerCustomData } from './handlers/handler-data';
import { runFromObj } from './run-util';

/**
 * A class used to track the current state of the game
 */
export class GameState {
    /**
     * The settings that a game runs under
     */
    public readonly gameParams: GameParams;

    /**
     * The current round
     */
    public round: number = 0;

    /**
     * The number of players in the game, since the actual array is stored elsewhere
     * @todo numPlayers is a field used to enable the utility methods in this file post-refactoring it is not certain if it actually needs to exist
     */
    public numPlayers: number;

    /**
     * The scores of the hands
     */
    public scores: number[];

    /**
     * The cards of all hands
     */
    public hands!: Card[][];

    /**
     * This is where the three of a kind, four card runs are played for each of the hands
     */
    public played!: Run[][];

    /**
     * The deck currently in use
     */
    public deck: Deck;

    /**
     * The index of the dealer player
     */
    public dealer: number;

    public data: HandlerCustomData[];

    /**
     * Create a new game state
     * @param numPlayers the number of players
     * @param gameParams the settings to use
     */
    constructor(numPlayers: number, gameParams: GameParams) {
        this.gameParams = gameParams;
        this.numPlayers = numPlayers;
        this.scores = new Array(numPlayers).fill(0, 0, numPlayers);
        this.dealer = 0;
        this.deck = new Deck(2);
        this.data = new Array(this.numPlayers).fill(0).map(() => ({}));
        this.setupRound();
    }

    /**
     * Sets up the state for a new round
     */
    public setupRound() {
        this.hands = new Array(this.numPlayers).fill(0).map(() => []);
        this.played = new Array(this.numPlayers).fill(0).map(() => []);
    }

    /**
     * Returns the number to deal at the beginning for the current round
     */
    public getNumToDeal() {
        const roundNeeded = this.getRound().reduce((one, two) => one + two, 0);
        if (this.getRound() === this.gameParams.rounds[-1]) {
            return roundNeeded; // on the last hand, since there is no discard, deal one less
        }
        return roundNeeded + 1;
    }

    /**
     * Returns whether it is the last round
     * @todo consider renaming
     */
    public isLastRound() {
        return this.round === this.gameParams.rounds.length - 1;
    }

    /**
     * Advance to the next round
     */
    public nextRound() {
        this.round += 1;
        this.dealer = (this.dealer + 1) % this.numPlayers;
        return this.getRound();
    }

    /**
     * Return the current round
     */
    public getRound() {
        return this.gameParams.rounds[this.round];
    }

    public transformToHandlerData(position: number): HandlerData {
        // TODO is cloneDeep needed and should deepFreeze be used
        return {
            gameParams: GameParams.fromObj(this.gameParams),
            dealer: this.dealer,
            hand: this.hands[position].map(card => Card.fromObj(card)),
            numPlayers: this.numPlayers,
            played: this.played.map(runs => runs.map(run => runFromObj(run))),
            position,
            round: this.round,
            scores: this.scores.slice(),
            data: this.data[position]
        };
    }
}
