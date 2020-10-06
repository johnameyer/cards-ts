import { GenericGameState, Meld, Card, Deck } from '@cards-ts/core';
import { GameParams } from './game-params';

/**
 * A class used to track the current state of the game
 */
export interface GameState extends GenericGameState<GameParams, GameState.State> {
    /**
     * The current round
     */
    round: number;

    /**
     * The scores of the hands
     */
    points: number[];

    /**
     * This is where the three of a kind, four card runs are played for each of the hands
     */
    played: Meld[][];

    /**
     * The index of the dealer player
     */
    dealer: number;

    /**
     * The index of the player who will be next
     */
    whoseTurn: number;

    toGoDown: Meld[];
    toPlayOnOthers: Card[][][];
    toDiscard: Card | null;

    wantCard: boolean;

    whoseAsk: number;
}

export namespace GameState {
    export enum State {
        START_GAME,

        START_ROUND,
        WAIT_FOR_TURN_PLAYER_WANT,
        HANDLE_TURN_PLAYER_WANT,

        WAIT_FOR_PLAYER_WANT,
        HANDLE_PLAYER_WANT,

        HANDLE_NO_PLAYER_WANT,

        START_TURN,
        WAIT_FOR_TURN,
        HANDLE_TURN,

        END_ROUND,

        END_GAME
    }

    export namespace Helper {
        /**
         * Sets up the state for a new round
         */
        export function setupRound(gameState: GameState) {
            gameState.hands = new Array(gameState.numPlayers).fill(0).map(() => []);
            gameState.played = new Array(gameState.numPlayers).fill(0).map(() => []);
            gameState.deck = new Deck(2, true);
        }
        
        /**
         * Returns the number to deal at the beginning for the current round
         */
        export function getNumToDeal(gameState: GameState) {
            const roundNeeded = getRound(gameState).reduce((one, two) => one + two, 0);
            if (getRound(gameState) === gameState.gameParams.rounds[-1]) {
                return roundNeeded; // on the last hand, since there is no discard, deal one less
            }
            return roundNeeded + 1;
        }

        /**
         * Returns whether it is the last round
         * @todo consider renaming
         */
        export function isLastRound(gameState: GameState) {
            return gameState.round === gameState.gameParams.rounds.length - 1;
        }

        /**
         * Advance to the next round
         */
        export function nextRound(gameState: GameState) {
            gameState.round += 1;
            gameState.dealer = (gameState.dealer + 1) % gameState.numPlayers;
            return getRound(gameState);
        }

        /**
         * Return the current round
         */
        export function getRound(gameState: GameState) {
            return gameState.gameParams.rounds[gameState.round];
        }
    }
}