import { Handler, HandlerChain } from "../handlers/handler";
import { SystemHandlerParams } from "../handlers/system-handler";
import { Intermediary } from "../intermediary/intermediary";
import { IntermediarySystemHandler } from "../intermediary/intermediary-system-handler";
import { AbstractStateTransformer } from "./abstract-state-transformer";
import { GameDriver } from "./game-driver";
import { GenericGameSetup } from "./generic-game-setup";
import { GenericGameState } from "./generic-game-state";
import { GenericGameStateIterator } from "./generic-game-state-iterator";
import { GenericResponseValidator } from "./generic-response-validator";
import { Message } from "./message";

/**
 * Wraps the classes in a game library into one common interface to make usages less verbose
 */
export abstract class AbstractGameFactory<HandlerData, Handles extends {[key: string]: any[]}, GameParams, State, GameState extends GenericGameState<GameParams, State>, ResponseMessage extends Message, StateTransformer extends AbstractStateTransformer<GameParams, State, HandlerData, GameState, ResponseMessage>, ResponseValidator extends GenericResponseValidator<GameParams, State, GameState, ResponseMessage>> {
    protected abstract getGameStateIterator(): GenericGameStateIterator<HandlerData, ResponseMessage, Handles & SystemHandlerParams, GameParams, State, GameState, StateTransformer>;

    // TODO with https://github.com/johnameyer/can-i-have-that/issues/45 make more of these protected?
    abstract getResponseValidator(): ResponseValidator;
    abstract getStateTransformer(): StateTransformer;
    abstract getGameSetup(): GenericGameSetup<GameParams>;

    abstract getIntermediaryHandler(intermediary: Intermediary): Handler<Handles, HandlerData, ResponseMessage>;
    abstract getDefaultBotHandler(): Handler<Handles, HandlerData, ResponseMessage>;

    getIntermediaryHandlerChain(intermediary: Intermediary): HandlerChain<Handles & SystemHandlerParams, HandlerData, ResponseMessage> {
        return new HandlerChain<Handles & SystemHandlerParams, HandlerData, ResponseMessage>().append<keyof Handles>(this.getIntermediaryHandler(intermediary)).append(new IntermediarySystemHandler(intermediary));
    }

    getDefaultBotHandlerChain() {
        return new HandlerChain<Handles & SystemHandlerParams, HandlerData, ResponseMessage>().append<keyof Handles>(this.getDefaultBotHandler());
    }

    getGameDriver(players: HandlerChain<Handles & SystemHandlerParams, HandlerData, ResponseMessage>[], state: GameState) {
        return new GameDriver(players, state, this.getGameStateIterator(), this.getStateTransformer(), this.getResponseValidator());
    }
}