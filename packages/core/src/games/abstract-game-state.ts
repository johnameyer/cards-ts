import { Deck } from '../cards/deck';
import { Card } from '../cards/card';
import { AbstractHandlerData } from './abstract-handler-data';

/**
 * A class used to track the current state of the game
 */
export abstract class AbstractGameState<GameParams, State, HandlerData extends AbstractHandlerData> {
    /**
     * The settings that a game runs under
     */
    public readonly gameParams: GameParams;

    /**
     * The number of players in the game, since the actual array is stored elsewhere
     * @todo numPlayers is a field used to enable the utility methods in this file post-refactoring it is not certain if it actually needs to exist
     */
    public numPlayers: number;

    /**
     * The names of all the players
     */
    public names!: string[];

    /**
     * The cards of all hands
     */
    public hands!: Card[][];

    /**
     * The deck currently in use
     */
    public deck!: Deck;

    public state!: State;

    public completed: boolean;

    public data: unknown[];

    /**
     * Create a new game state
     * @param numPlayers the number of players
     * @param gameParams the settings to use
     */
    constructor(numPlayers: number, gameParams: GameParams, initialState: State) {
        this.gameParams = gameParams;
        this.numPlayers = numPlayers;
        this.names = new Array(numPlayers);
        this.completed = false;
        this.data = new Array(this.numPlayers).fill(0).map(() => ({}));
        this.hands = new Array(this.numPlayers).fill(0).map(() => new Array());
        this.state = initialState;
    }

    abstract transformToHandlerData(position: number): HandlerData;

    fromObj(obj: any) {
        // TODO better shape checking
        if(!(obj instanceof Object)) {
            throw new Error('Not an object');
        }
        if(!Array.isArray(obj.data) || !Array.isArray(obj.hands) || !Array.isArray(obj.names) || !Array.isArray(obj.played) || !Array.isArray(obj.scores)) {
            throw new Error('Shape of object is wrong');
        }
        // @ts-ignore
        this.gameParams = obj.gameParams;
        this.completed = obj.completed;
        this.data = obj.data;
        this.deck = Deck.fromObj(obj.deck);
        this.hands = obj.hands.map((hand: Card[]) => hand.map(card => Card.fromObj(card)));
        this.names = obj.names;
        this.numPlayers = obj.numPlayers;
        this.state = obj.state;

        return this;
    }
}