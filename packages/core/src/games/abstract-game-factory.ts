import { Handler, HandlerChain } from '../handlers/handler.js';
import { SystemHandlerParams } from '../handlers/system-handler.js';
import { Intermediary } from '../intermediary/intermediary.js';
import { IntermediarySystemHandler } from '../intermediary/intermediary-system-handler.js';
import { Message } from '../messages/message.js';
import { SerializableObject } from '../intermediary/serializable.js';
import { ControllerHandlerState, ControllerState, ControllersProviders, IndexedControllers } from '../controllers/controller.js';
import { Provider } from '../util/provider.js';
import { EventHandlerInterface } from './event-handler-interface.js';
import { GameDriver } from './game-driver.js';
import { GenericGameSetup } from './generic-game-setup.js';
import { GenericGameState } from './generic-game-state.js';
import { GenericGameStateTransitions } from './generic-game-state-transitions.js';
import { DefaultControllerKeys, DefaultControllers, buildDefaultProviders } from './default-controllers.js';
import { GenericHandlerProxy } from './generic-handler-controller.js';
import { STANDARD_STATES } from './game-states.js';

/**
 * Wraps the classes in a game library into one common interface to make usages less verbose and to hide internal implementation details
 * @typeParam Handles the custom event handlers that this game has
 * @typeParam GameParams the custom params for this game
 * @typeParam State the state enum for this game
 * @typeParam Controllers the state controllers for this game
 * @typeParam ResponseMessage the response messages this game expects
 * @typeParam EventHandler the event handler for this game
 */
export abstract class AbstractGameFactory<Handles extends {[key: string]: unknown[]}, GameParams extends SerializableObject, State extends typeof STANDARD_STATES, Controllers extends IndexedControllers, ResponseMessage extends Message, EventHandler extends EventHandlerInterface<Controllers, ResponseMessage>> {
    // TODO remove event handler since it doesn't matter here

    // TODO the abstract members here should probably just be broken into another class that this class then consumes, perhaps with https://github.com/johnameyer/cards-ts/issues/45 ?

    /**
     * Returns the game state transitions for this game
     */
    protected abstract getGameStateTransitions(): GenericGameStateTransitions<State, Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>;

    // TODO with https://github.com/johnameyer/cards-ts/issues/45 make more of these protected?
    /**
     * Returns the state transformer for this game
     */
    abstract getEventHandler(): EventHandler;

    /**
     * Returns the game setup for this game
     */
    abstract getGameSetup(): GenericGameSetup<GameParams>;

    /**
     * Returns the default intermediary game handler
     * @param intermediary the intermediary to wrap
     */
    abstract getIntermediaryHandler(intermediary: Intermediary): Handler<Handles, ControllerHandlerState<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>, ResponseMessage>;
    
    /**
     * Returns the default bot game handler
     */
    abstract getDefaultBotHandler(): Handler<Handles, ControllerHandlerState<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>, ResponseMessage>;

    /**
     * Returns the controller providers specific to the game, to be merged with the default controllers
     */
    abstract getProviders(): Omit<ControllersProviders<Controllers>, DefaultControllerKeys>;

    /**
     * Creates a new handler chain containing the intermediary handler and the system intermediary handler
     */
    getIntermediaryHandlerChain(intermediary: Intermediary): HandlerChain<Handles & SystemHandlerParams, ControllerHandlerState<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>, ResponseMessage> {
        return new HandlerChain<Handles & SystemHandlerParams, ControllerHandlerState<Controllers>, ResponseMessage>().append(this.getIntermediaryHandler(intermediary))
            .append(new IntermediarySystemHandler(intermediary) as Handler<SystemHandlerParams, ControllerHandlerState<Controllers>, ResponseMessage>);
    }

    /**
     * Creates a new handler chain containing only the bot handler for the game events
     */
    getDefaultBotHandlerChain(): HandlerChain<Handles & SystemHandlerParams, ControllerHandlerState<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>, ResponseMessage> {
        return new HandlerChain<Handles & SystemHandlerParams, ControllerHandlerState<Controllers>, ResponseMessage>().append(this.getDefaultBotHandler());
    }

    /**
     * Creates a new driver using elements from this game factory
     * @param players the players in the game
     * @param params the params to run this game under
     * @param names the initial names of the players
     * @param state the state to wrap
     */
    getGameDriver(players: HandlerChain<Handles & SystemHandlerParams, ControllerHandlerState<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>, ResponseMessage>[], params: GameParams, names: string[], state?: ControllerState<Controllers>) {
        const handlerData = new Provider<(position: number) => any>();
        const handlerProxy = new GenericHandlerProxy(players, handlerData);
        const providers = { ...this.getProviders(), ...buildDefaultProviders(params, names, handlerProxy) } as any as ControllersProviders<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>;
        const gameState = new GenericGameState<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>(providers, state);
        handlerData.set((position) => gameState.asHandlerData(position));
        return new GameDriver(handlerProxy, gameState, this.getGameStateTransitions(), this.getEventHandler());
    }
}
