import { AbstractGameState } from './abstract-game-state';
import { Message } from './message';
import { AbstractHandler } from './abstract-handler';
import { AbstractStateTransformer } from './abstract-state-transformer';
import { zip } from '../util/zip';
import { defined } from '../util/defined';

/**
 * Class that handles the steps of the game
 */
export abstract class AbstractGameDriver<HandlerData, Handler extends AbstractHandler<HandlerData>, GameParams, State, GameState extends AbstractGameState<GameParams, State>, ResponseMessage extends Message, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>> {
    protected players: Handler[];
    protected readonly outgoingData: Promise<void>[];

    /**
     * Create the game driver
     * @param players the players in the game
     * @param gameParams the parameters to use for the game
     */
    constructor(players: Handler[], protected gameState: GameState, protected stateTransformer: StateTransformer) {
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
            await this.handleOutgoing();
            if(next !== undefined) {
                this.stateTransformer.merge(this.gameState, await next);
            }
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
        this.outgoingData.push(Promise.resolve(this.players[position].message(this.stateTransformer.transformToHandlerData(this.gameState, position), message)[0]));
    }

    /**
     * Send a message to all the players
     * @param message the message to send
     */
    messageAll(message: Message) {
        this.outgoingData.push(...this.players.map((player, position) => Promise.resolve(player.message(this.stateTransformer.transformToHandlerData(this.gameState, position), message)[0])));
    }

    /**
     * Send a message to all the players minus the excluded
     * @param players the array of players
     * @param excludedPosition the player to not send to
     * @param message the message to send
     */
    messageOthers(excludedPosition: number, message: Message) {
        this.outgoingData.push(...this.players.filter((_, position) => position !== excludedPosition).map((player, position) =>
            Promise.resolve(player.message(this.stateTransformer.transformToHandlerData(this.gameState, position), message)[0])
        ));
    }

    /**
     * Notify all the players minus the excluded
     * @param players the array of players
     * @param excluded the player to not send to
     * @param bundle the message to send
     */
    waitingOthers(waitingOn?: Handler[]) {
        this.outgoingData.push(...this.players.filter(player => !waitingOn?.includes(player)).map((player, position) => 
            Promise.resolve(player.waiting(this.stateTransformer.transformToHandlerData(this.gameState, position), waitingOn && this.gameState ? waitingOn.map(this.players.indexOf).map(position => this.gameState.names[position]) : undefined)[0])
        ));
    }

    handlerCall(position: number, action: keyof Handler, ...args: any[]) {
        const [send, receive] = this.players[position][action](this.stateTransformer.transformToHandlerData(this.gameState, position), args)

        if(send) {
            this.outgoingData.push(send);
        }
        return receive;
    }

    handlerCallAll(action: keyof Handler, ...args: any[]) {
        const [sent, received] = zip(...this.players.map((player, position) =>
            player[action](this.stateTransformer.transformToHandlerData(this.gameState, position), args)
        )) as [(void | Promise<void>)[], []];
        this.outgoingData.push(...sent.filter(defined));
        return received;
    }

    async handleOutgoing() {
        await Promise.all(this.outgoingData);
        this.outgoingData.splice(0, this.outgoingData.length);
    }
}