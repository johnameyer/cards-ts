import { AbstractGameState } from './abstract-game-state';
import { Message } from './message';
import { AbstractHand } from './abstract-hand';
import { AbstractHandler } from './abstract-handler';

/**
 * Class that handles the steps of the game
 */
export abstract class AbstractGameDriver<HandlerData, Handler extends AbstractHandler<HandlerData>, Hand extends AbstractHand<GameParams, State, HandlerData, Handler, GameState>, GameParams, State, GameState extends AbstractGameState<GameParams, State, HandlerData>> {
    protected players: Hand[];
    protected gameState: GameState;
    protected readonly outgoingData: Promise<void>[];

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

        this.outgoingData = [];
    }

    /**
     * Runs the game through to the end asyncronously
     */
    public async start() {
        const state = this.gameState;
        while(!state.completed) {
            const next = this.iterate();
            if(next !== undefined) {
                this.gameState.merge(await next);
            }
            await this.handleOutgoing();
        }
    }

    /**
     * Runs the game until the next time it would have to wait
     */
    public resume() {
        const state = this.gameState;
        while(!state.completed) {
            const next = this.iterate();
            if(next !== undefined) {
                return next;
            }
        }
    }

    /**
     * Proceed to the next state of the game
     * @returns void if the state is not waiting for a user, or a promise to the data returned from a user
     */
    public abstract iterate(): void | Promise<any>;
    
    /**
     * Send a message to a player
     * @param message the message to send
     */
    message(position: number, message: Message) {
        this.outgoingData.push(this.players[position].message(message, this.gameState));
    }

    /**
     * Send a message to all the players
     * @param message the message to send
     */
    messageAll(message: Message) {
        this.outgoingData.push(...this.players.map(player => player.message(message, this.gameState)));
    }

    /**
     * Send a message to all the players minus the excluded
     * @param players the array of players
     * @param excludedPosition the player to not send to
     * @param message the message to send
     */
    messageOthers(excludedPosition: number, message: Message) {
        this.outgoingData.push(...this.players.filter((_, index) => index !== excludedPosition).map(player =>
            player.message(message, this.gameState)
        ));
    }

    /**
     * Notify all the players minus the excluded
     * @param players the array of players
     * @param excluded the player to not send to
     * @param bundle the message to send
     */
    waitingOthers(players: Hand[], waitingOn?: Hand[]) {
        this.outgoingData.push(...players.filter(player => !waitingOn?.includes(player)).map(player => 
            player.waiting(waitingOn && this.gameState ? waitingOn.map(player => player.position).map(position => this.gameState.names[position]) : undefined, this.gameState)
        ));
    }

    async handleOutgoing() {
        await Promise.all(this.outgoingData);
        this.outgoingData.splice(0, this.outgoingData.length);
    }
}