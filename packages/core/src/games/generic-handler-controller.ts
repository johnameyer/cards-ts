import { isDefined } from '../util/is-defined';
import { Message } from '../messages/message';
import { ResponseQueue } from './response-queue';
import { range } from '../util/range';
import { HandlerChain } from '../handlers/handler';
import { SystemHandlerParams } from '../handlers/system-handler';
import { AbstractController, GenericControllerProvider, ControllerHandlerState } from '../controllers/controller';
import { WaitingController } from '../controllers/waiting-controller';
import { Provider } from '../util/provider';
import { GameStateController } from '../controllers';

type PlayerHandlerState = {
    count: number;

    position: number;
}

/**
 * Class that allows calls to the handlers
 */
export class GenericHandlerProxy<ResponseMessage extends Message, Handlers extends {[key: string]: any[]} & SystemHandlerParams> {
    constructor(protected players: HandlerChain<Handlers, ControllerHandlerState<any>, ResponseMessage>[], private readonly handlerData: Provider<(position: number) => any>) { }

    private readonly outgoingData: Promise<void>[] = [];

    private readonly incomingData = new ResponseQueue<ResponseMessage>();

    // getNames() {
    //     const names: string[] = [];
    //     for(let i = 0; i < this.players.length; i++) {
    //         names[i] = this.players[i].getName(names);
    //     }
    //     return names;
    // }

    message(position: number, message: Message) {
        this.outgoingData.push(Promise.resolve(this.players[position].call('message', this.handlerData.get()(position), this.incomingData.for(position), message)));
    }

    messageAll(message: Message) {
        this.outgoingData.push(...this.players
            .map((player, position) => Promise.resolve(player.call('message', this.handlerData.get()(position), this.incomingData.for(position), message)))
            .filter(isDefined)
        );
    }

    messageOthers(excludedPosition: number, message: Message) {
        this.outgoingData.push(...this.players
            .filter((_, position) => position !== excludedPosition)
            .map((player, position) =>
                Promise.resolve(player.call('message', this.handlerData.get()(position), this.incomingData.for(position), message))
            ).filter(isDefined)
        );
    }

    waitingOthers(waitingOn?: number[]) {
        this.outgoingData.push(...this.players
            .filter((_player, index) => !waitingOn?.includes(index))
            .map((player, position) =>
                Promise.resolve(player.call('waitingFor', this.handlerData.get()(position), this.incomingData.for(position), waitingOn))
            ).filter(isDefined)
        );
    }

    handlerCall<Method extends keyof Handlers>(position: number, method: Method, ...args: Handlers[Method]): void {
        const send = this.players[position].call(method, this.handlerData.get()(position), this.incomingData.for(position), ...args);

        if(send) {
            this.outgoingData.push(send);
        }
    }

    handlerCallAll<Method extends keyof Handlers>(method: Method, ...args: Handlers[Method]): void {
        this.outgoingData.push(...this.players
            .map((player, position) => {
                try {
                    return player.call(method, this.handlerData.get()(position), this.incomingData.for(position), ...args);
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

    get count() {
        return this.players.length;
    }
}

type HandlerControllerDependencies = {
    waiting: WaitingController;
};

export class GenericHandlerControllerProvider<ResponseMessage extends Message, Handlers extends {[key: string]: any[]} & SystemHandlerParams> implements GenericControllerProvider<undefined, HandlerControllerDependencies, GenericHandlerController<ResponseMessage, Handlers>> {
    constructor(private readonly handlerProxy: GenericHandlerProxy<ResponseMessage, Handlers>) { }
    
    controller(_state: undefined, controllers: HandlerControllerDependencies): GenericHandlerController<ResponseMessage, Handlers> {
        return new GenericHandlerController(this.handlerProxy, controllers);
    }
    
    initialState(): undefined {
        return undefined;
    }

    dependencies() {
        return { waiting: true } as const;
    }
}

// TODO figure out if we need response message here at all or whether we should shoot for incoming messge
export class GenericHandlerController<ResponseMessage extends Message, Handlers extends {[key: string]: any[]} & SystemHandlerParams> extends AbstractController<undefined, HandlerControllerDependencies, PlayerHandlerState> {
    constructor(private readonly handlerProxy: GenericHandlerProxy<ResponseMessage, Handlers>, controllers: HandlerControllerDependencies) {
        super(undefined, controllers);
    }

    getFor(position: number) {
        return {
            count: this.count,
            position
        };
    }

    /**
     * Send a message to a player
     * @param message the message to send
     */
    message(position: number, message: Message) {
        this.handlerProxy.message(position, message);
    }

    /**
     * Send a message to all the players
     * @param message the message to send
     */
    messageAll(message: Message) {
        this.handlerProxy.messageAll(message);
    }

    /**
     * Send a message to all the players minus the excluded
     * @param players the array of players
     * @param excludedPosition the player to not send to
     * @param message the message to send
     */
    messageOthers(excludedPosition: number, message: Message) {
        this.handlerProxy.messageOthers(excludedPosition, message);
    }

    /**
     * Calls the handler chain at the specified position
     * @param gameState the game state
     * @param position the position of the handler to call
     * @param method the event type to call
     * @param args the args to call with
     */
    handlerCall<Method extends keyof Handlers>(position: number, method: Method, ...args: Handlers[Method]): void {
        this.controllers.waiting.set([position]);
        this.handlerProxy.handlerCall(position, method, ...args);
    }

    /**
     * Calls all the handlers and waits for N to respond
     * @param gameState the game state
     * @param method the event type to call
     * @param numToWaitFor the number of handlers to wait for
     * @param args the args to call with
     */
    handlerCallFirst<Method extends keyof Handlers>(method: Method, numToWaitFor = 1, ...args: Handlers[Method]): void {
        this.controllers.waiting.set(numToWaitFor);
        this.handlerProxy.handlerCallAll(method, ...args);
    }

    /**
     * Calls all the handlers and wait for a response
     * @param gameState the game state
     * @param method the event type to call
     * @param args the args to call with
     */
    handlerCallAll<Method extends keyof Handlers>(method: Method, waitFor: number[] = range(this.count), ...args: Handlers[Method]): void { 
        this.controllers.waiting.set(waitFor);
        this.handlerProxy.handlerCallAll(method, ...args);
    }

    get count() {
        return this.handlerProxy.count;
    }
}