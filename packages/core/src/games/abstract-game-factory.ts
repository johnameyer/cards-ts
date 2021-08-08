import { Handler, HandlerChain } from "../handlers/handler";
import { SystemHandlerParams } from "../handlers/system-handler";
import { Intermediary } from "../intermediary/intermediary";
import { IntermediarySystemHandler } from "../intermediary/intermediary-system-handler";
import { EventHandlerInterface } from "./event-handler-interface";
import { GameDriver } from "./game-driver";
import { GenericGameSetup } from "./generic-game-setup";
import { GenericGameState } from "./generic-game-state";
import { GenericGameStateTransitions } from "./generic-game-state-transitions";
import { Message } from "../messages/message";
import { SerializableObject } from "../intermediary/serializable";
import { buildDefaultProviders, DefaultControllerKeys, DefaultControllers } from "./default-controllers";
import { ControllerHandlerState, ControllersProviders, ControllerState, IndexedControllers, IndexedProviders, UnwrapProviders } from "../controllers/controller";
import { GenericHandlerProxy } from "./generic-handler-controller";
import { Provider } from "../util/provider";
import { STANDARD_STATES } from "./game-states";

/**
 * Wraps the classes in a game library into one common interface to make usages less verbose
 */
export abstract class AbstractGameFactory<Handles extends {[key: string]: any[]}, GameParams extends SerializableObject, State extends typeof STANDARD_STATES, Controllers extends IndexedControllers, ResponseMessage extends Message, EventHandler extends EventHandlerInterface<Controllers, ResponseMessage>> {

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

    abstract getProviders(): Omit<ControllersProviders<Controllers>, DefaultControllerKeys>;

    /**
     * Creates a new handler chain containing the intermediary handler and the system intermediary handler
     */
    getIntermediaryHandlerChain(intermediary: Intermediary): HandlerChain<Handles & SystemHandlerParams, ControllerHandlerState<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>, ResponseMessage> {
        return new HandlerChain<Handles & SystemHandlerParams, ControllerHandlerState<Controllers>, ResponseMessage>().append(this.getIntermediaryHandler(intermediary)).append(new IntermediarySystemHandler(intermediary));
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
     * @param state the state to wrap
     */
    getGameDriver(players: HandlerChain<Handles & SystemHandlerParams, ControllerHandlerState<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>, ResponseMessage>[], params: GameParams, names: string[], state?: ControllerState<Controllers>) {
        const handlerData = new Provider<(position: number) => any>();
        const handlerProxy = new GenericHandlerProxy(players, handlerData);
        const providers = { ...this.getProviders(), ...buildDefaultProviders(params, names, STANDARD_STATES.START_GAME, handlerProxy) } as any as ControllersProviders<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>;
        const gameState = new GenericGameState<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>(providers, state);
        handlerData.set((position) => gameState.asHandlerData(position));
        return new GameDriver(handlerProxy, gameState, this.getGameStateTransitions(), this.getEventHandler());
    }
}