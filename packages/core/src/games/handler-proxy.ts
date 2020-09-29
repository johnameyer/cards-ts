import { isDefined } from "../util/is-defined";
import { zip } from "../util/zip";
import { AbstractGameState } from "./abstract-game-state";
import { AbstractHandler } from "./abstract-handler";
import { AbstractStateTransformer } from "./abstract-state-transformer";
import { Message } from "./message";

// TODO convert to inner class of game driver when properly supported
export class HandlerProxy<HandlerData, Handler extends AbstractHandler<HandlerData>, GameParams, State, GameState extends AbstractGameState<GameParams, State>, ResponseMessage extends Message, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>> {
    constructor(protected players: Handler[], protected stateTransformer: StateTransformer) { }

    public readonly outgoingData: Promise<void>[] = [];

    // getNames() {
    //     const names: string[] = [];
    //     for(let i = 0; i < this.players.length; i++) {
    //         names[i] = this.players[i].getName(names);
    //     }
    //     return names;
    // }

    /**
     * Send a message to a player
     * @param message the message to send
     */
    message(gameState: GameState, position: number, message: Message) {
        this.outgoingData.push(Promise.resolve(this.players[position].message(this.stateTransformer.transformToHandlerData(gameState, position), message)[0]));
    }

    /**
     * Send a message to all the players
     * @param message the message to send
     */
    messageAll(gameState: GameState, message: Message) {
        this.outgoingData.push(...this.players.map((player, position) => Promise.resolve(player.message(this.stateTransformer.transformToHandlerData(gameState, position), message)[0])));
    }

    /**
     * Send a message to all the players minus the excluded
     * @param players the array of players
     * @param excludedPosition the player to not send to
     * @param message the message to send
     */
    messageOthers(gameState: GameState, excludedPosition: number, message: Message) {
        this.outgoingData.push(...this.players.filter((_, position) => position !== excludedPosition).map((player, position) =>
            Promise.resolve(player.message(this.stateTransformer.transformToHandlerData(gameState, position), message)[0])
        ));
    }

    /**
     * Notify all the players minus the excluded
     * @param players the array of players
     * @param excluded the player to not send to
     * @param bundle the message to send
     */
    waitingOthers(gameState: GameState, waitingOn?: number[]) {
        this.outgoingData.push(...this.players.filter((player, index) => !waitingOn?.includes(index)).map((player, position) => 
            Promise.resolve(player.waitingFor(this.stateTransformer.transformToHandlerData(gameState, position), waitingOn && gameState ? waitingOn.map(position => gameState.names[position]) : undefined)[0])
        ));
    }

    handlerCall<Action extends keyof Handler>(gameState: GameState, position: number, action: Action, ...args: any[]): ReturnType<Handler[Action]>[1] {
        const [send, receive] = this.players[position][action](this.stateTransformer.transformToHandlerData(gameState, position), args)

        if(send) {
            this.outgoingData.push(send);
        }
        return receive;
    }

    handlerCallAll<Action extends keyof Handler>(gameState: GameState, action: Action, ...args: any[]): ReturnType<Handler[Action]>[1][] {
        const [sent, received] = zip(...this.players.map((player, position) => {
            try {
                return player[action](this.stateTransformer.transformToHandlerData(gameState, position), args);
            } catch(e) {
                console.error(e);
            }
            return [];
        })) as [(void | Promise<void>)[], ReturnType<Handler[Action]>[1][]];
        this.outgoingData.push(...sent.filter(isDefined));
        return received;
    }

    async handleOutgoing() {
        await Promise.all(this.outgoingData);
        this.outgoingData.splice(0, this.outgoingData.length);
    }

    getNumberOfPlayers() {
        return this.players.length;
    }
}