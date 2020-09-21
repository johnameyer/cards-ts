import { AbstractGameState } from './abstract-game-state';
import { Message } from './message';
import { AbstractHand } from './abstract-hand';
import { AbstractHandler } from './abstract-handler';
import { Hand } from '../can-i-have-that/hand';

/**
 * Class that handles the steps of the game
 */
export abstract class AbstractGameDriver<HandlerData, Handler extends AbstractHandler<HandlerData>, Hand extends AbstractHand<GameParams, State, HandlerData, Handler, GameState>, GameParams, State, GameState extends AbstractGameState<GameParams, State, HandlerData>> {
    protected players: Hand[];
    protected gameState: GameState;

    /**
     * Create the game driver
     * @param players the players in the game
     * @param gameParams the parameters to use for the game
     */
    constructor(players: Hand[], gameState: GameState) {
        this.gameState = gameState;
        // this.players = players.map((handler, i) => new Hand(handler, i));
        this.players = players;
        for(let i = 0; i < players.length; i++) {
            this.gameState.names[i] = this.players[i].getName(this.gameState.names.slice(0, i));
        }
    }

    /**
     * Runs the game through to the end asyncronously
     */
    public async start() {
        const state = this.gameState;
        while(!state.completed) {
            await this.iterate();
        }
    }

    public abstract async iterate(): Promise<void>;
    
    /**
     * Send a message to a player
     * @param message the message to send
     */
    message(position: number, message: Message) {
        this.players[position].message(message, this.gameState);
    }

    /**
     * Send a message to all the players
     * @param message the message to send
     */
    messageAll(message: Message) {
        this.players.forEach((player) => player.message(message, this.gameState));
    }

    /**
     * Send a message to all the players minus the excluded
     * @param players the array of players
     * @param excludedPosition the player to not send to
     * @param message the message to send
     */
    messageOthers(excludedPosition: number, message: Message) {
        this.players.forEach((player, index) => {
            if(index !== excludedPosition) {
                player.message(message, this.gameState);
            }
        });
    }

    /**
     * Notify all the players minus the excluded
     * @param players the array of players
     * @param excluded the player to not send to
     * @param bundle the message to send
     */
    waitingOthers(players: Hand[], waitingOn?: Hand) {
        players.forEach((player) => {
            if(player !== waitingOn)
                player.waiting(waitingOn && this.gameState ? this.gameState.names[waitingOn.position] : undefined);
        });
    }

}