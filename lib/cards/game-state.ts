import { Deck } from './deck';
import { GameParams } from './game-params';
import { Card, Run } from '..';

function rotate(li: any[], x: number) {
    const firstPart = li.slice(0, x);
    const lastPart = li.slice(x);
    return [...lastPart, ...firstPart];
}

export class GameState {
    public readonly gameParams: GameParams;
    public round: number = 0;
    /**
     * TODO numPlayers is a field used to enable the utility methods in this file post-refactoring it is not certain if it actually needs to exist
     */
    public numPlayers: number;

    public scores: number[];
    /**
     * The cards of all hands
     */
    public hands!: Card[][];
    /**
     * This is where the three of a kind, four card runs are played
     */
    public played!: Run[][];

    public deck: Deck;
    public dealer: number;

    constructor(numPlayers: number, gameParams: GameParams) {
        this.gameParams = gameParams;
        this.numPlayers = numPlayers;
        this.scores = new Array(numPlayers).fill(0, 0, numPlayers);
        this.dealer = 0;
        this.deck = new Deck(2);
        this.setupRound();
    }

    public setupRound() {
        this.hands = new Array(this.numPlayers).fill(0).map(() => []);
        this.played = new Array(this.numPlayers).fill(0).map(() => []);
    }

    public getNumToDeal() {
        const roundNeeded = this.getRound().reduce((one, two) => one + two, 0);
        if (this.getRound() === this.gameParams.rounds[-1]) {
            return roundNeeded; // on the last hand,
        }
        return roundNeeded + 1;
    }

    // TODO rename
    public isLastRound() {
        return this.round === this.gameParams.rounds.length - 1;
    }

    public nextRound() {
        this.round += 1;
        this.dealer = (this.dealer + 1) % this.numPlayers;
        return this.getRound();
    }

    public getRound() {
        return this.gameParams.rounds[this.round];
    }
}
