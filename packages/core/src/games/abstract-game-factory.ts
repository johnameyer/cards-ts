import { Handler, HandlerChain } from "../handlers/handler";
import { SystemHandlerParams } from "../handlers/system-handler";
import { Intermediary } from "../intermediary/intermediary";
import { IntermediarySystemHandler } from "../intermediary/intermediary-system-handler";
import { AbstractStateTransformer } from "./abstract-state-transformer";
import { GameDriver } from "./game-driver";
import { GenericGameSetup } from "./generic-game-setup";
import { GenericGameState } from "./generic-game-state";
import { GenericGameStateIterator } from "./generic-game-state-iterator";
import { GenericValidator } from "./generic-validator";
import { Message } from "../messages/message";
import { SerializableObject } from "../intermediary/serializable";

/**
 * Wraps the classes in a game library into one common interface to make usages less verbose
 */
export abstract class AbstractGameFactory<HandlerData, Handles extends {[key: string]: any[]}, GameParams extends SerializableObject, State extends string, GameState extends GenericGameState<GameParams, State>, ResponseMessage extends Message, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>, Validator extends GenericValidator<GameParams, State, GameState, ResponseMessage>> {
    /**
     * Returns the game state iterator for this game
     */
    protected abstract getGameStateIterator(): GenericGameStateIterator<HandlerData, ResponseMessage, Handles & SystemHandlerParams, GameParams, State, GameState, StateTransformer>;

    // TODO with https://github.com/johnameyer/cards-ts/issues/45 make more of these protected?
    /**
     * Returns the response validator for this game
     */
    abstract getValidator(): Validator;
    
    /**
     * Returns the state transformer for this game
     */
    abstract getStateTransformer(): StateTransformer;

    /**
     * Returns the game setup for this game
     */
    abstract getGameSetup(): GenericGameSetup<GameParams>;

    /**
     * Returns the default intermediary game handler
     * @param intermediary the intermediary to wrap
     */
    abstract getIntermediaryHandler(intermediary: Intermediary): Handler<Handles, HandlerData, ResponseMessage>;
    
    /**
     * Returns the default bot game handler
     */
    abstract getDefaultBotHandler(): Handler<Handles, HandlerData, ResponseMessage>;

    /**
     * Creates a new handler chain containing the intermediary handler and the system intermediary handler
     */
    getIntermediaryHandlerChain(intermediary: Intermediary): HandlerChain<Handles & SystemHandlerParams, HandlerData, ResponseMessage> {
        return new HandlerChain<Handles & SystemHandlerParams, HandlerData, ResponseMessage>().append(this.getIntermediaryHandler(intermediary)).append(new IntermediarySystemHandler(intermediary));
    }

    /**
     * Creates a new handler chain containing only the bot handler for the game events
     */
    getDefaultBotHandlerChain() {
        return new HandlerChain<Handles & SystemHandlerParams, HandlerData, ResponseMessage>().append(this.getDefaultBotHandler());
    }

    /**
     * Creates a new driver using elements from this game factory
     * @param players the players in the game
     * @param state the state to wrap
     */
    getGameDriver(players: HandlerChain<Handles & SystemHandlerParams, HandlerData, ResponseMessage>[], state: GameState) {
        return new GameDriver(players, state, this.getGameStateIterator(), this.getStateTransformer(), this.getValidator());
    }
}