import { isDefined } from '../util/is-defined';
import { GenericGameState } from './generic-game-state';
import { AbstractStateTransformer } from './abstract-state-transformer';
import { Message } from './message';
import { ResponseQueue } from './response-queue';
import { range } from '../util/range';
import { Handler, HandlerAction, HandlerChain } from '../handlers/handler';
import { SystemHandlerParams } from '../handlers/system-handler';

type ExtractOfType<Type, ExpectedType> = {
    [key in keyof Type]: Type[key] extends ExpectedType ? key : never;
}[keyof Type];

/**
 * Class that allows calls to the handlers
 */
export class HandlerProxy<HandlerData, ResponseMessage extends Message, Handlers extends {[key: string]: any[]} & SystemHandlerParams, GameParams, State, GameState extends GenericGameState<GameParams, State>, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>> {
    constructor(protected players: HandlerChain<Handlers, HandlerData, ResponseMessage>[], protected stateTransformer: StateTransformer) { }

    private readonly outgoingData: Promise<void>[] = [];

    private readonly incomingData = new ResponseQueue<ResponseMessage>();

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
        this.outgoingData.push(Promise.resolve(this.players[position].call('message', this.stateTransformer.transformToHandlerData(gameState, position), this.incomingData.for(position), message)));
    }

    /**
     * Send a message to all the players
     * @param message the message to send
     */
    messageAll(gameState: GameState, message: Message) {
        this.outgoingData.push(...this.players
            .map((player, position) => Promise.resolve(player.call('message', this.stateTransformer.transformToHandlerData(gameState, position), this.incomingData.for(position), message)))
            .filter(isDefined)
        );
    }

    /**
     * Send a message to all the players minus the excluded
     * @param players the array of players
     * @param excludedPosition the player to not send to
     * @param message the message to send
     */
    messageOthers(gameState: GameState, excludedPosition: number, message: Message) {
        this.outgoingData.push(...this.players
            .filter((_, position) => position !== excludedPosition)
            .map((player, position) =>
                Promise.resolve(player.call('message', this.stateTransformer.transformToHandlerData(gameState, position), this.incomingData.for(position), message))
            ).filter(isDefined)
        );
    }

    /**
     * Notify all the players minus the excluded
     * @param players the array of players
     * @param excluded the player to not send to
     * @param bundle the message to send
     */
    waitingOthers(gameState: GameState, waitingOn?: number[]) {
        this.outgoingData.push(...this.players
            .filter((player, index) => !waitingOn?.includes(index))
            .map((player, position) =>
                Promise.resolve(player.call('waitingFor', this.stateTransformer.transformToHandlerData(gameState, position), this.incomingData.for(position), waitingOn && gameState ? waitingOn.map(position => gameState.names[position]) : undefined))
            ).filter(isDefined)
        );
    }

    handlerCall<Method extends keyof Handlers>(gameState: GameState, position: number, method: Method, ...args: Handlers[Method]): void {
        gameState.waiting = [position];
        gameState.responded = this.players.map(() => false);
        const send = this.players[position].call(method, this.stateTransformer.transformToHandlerData(gameState, position), this.incomingData.for(position), ...args);

        if(send) {
            this.outgoingData.push(send);
        }
    }

    handlerCallFirst<Method extends keyof Handlers>(gameState: GameState, method: Method, numToWaitFor = 1, ...args: Handlers[Method]): void {
        gameState.waiting = numToWaitFor;
        gameState.responded = this.players.map(() => false);
        this.outgoingData.push(...this.players
            .map((player, position) => {
                try {
                    return player.call(method, this.stateTransformer.transformToHandlerData(gameState, position), this.incomingData.for(position), ...args);
                } catch(e) {
                    console.error(e);
                }
                return;
            })
            .filter(isDefined)
        );
    }

    handlerCallAll<Method extends keyof Handlers>(gameState: GameState, method: Method, waitFor: number[] = range(this.getNumberOfPlayers()), ...args: Handlers[Method]): void {
        gameState.waiting = waitFor;
        gameState.responded = this.players.map(() => false);
        this.outgoingData.push(...this.players
            .map((player, position) => {
                try {
                    return player.call(method, this.stateTransformer.transformToHandlerData(gameState, position), this.incomingData.for(position), ...args);
                } catch(e) {
                    console.error(e);
                }
                return;
            })
            .filter(isDefined)
        );
    }

    async handleOutgoing() {
        await Promise.all(this.outgoingData);
        this.outgoingData.splice(0, this.outgoingData.length);
    }

    receiveSyncResponses() {
        return this.incomingData[Symbol.iterator]();
    }

    receiveAsyncResponses() {
        return this.incomingData[Symbol.asyncIterator]();
    }

    asyncResponseAvailable() {
        return this.incomingData.asyncResponsesAvailable();
    }

    getNumberOfPlayers() {
        return this.players.length;
    }
}