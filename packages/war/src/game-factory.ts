import { AbstractGameFactory, Intermediary } from "@cards-ts/core";
import { GameHandlerParams } from "./game-handler";
import { GameParams } from "./game-params";
import { GameSetup } from "./game-setup";
import { GameState } from "./game-state";
import { GameStateIterator } from "./game-state-iterator";
import { HandlerData } from "./handler-data";
import { DefaultBotHandler } from "./handlers/default-bot-handler";
import { IntermediaryHandler } from "./handlers/intermediary-handler";
import { ResponseMessage } from "./messages/response-message";
import { ResponseValidator } from "./response-validator";
import { StateTransformer } from "./state-transformer";

export class GameFactory extends AbstractGameFactory<HandlerData, GameHandlerParams, GameParams, GameState.State, GameState, ResponseMessage, StateTransformer, ResponseValidator> {
    protected getResponseValidator() {
        return new ResponseValidator();
    }

    protected getGameStateIterator() {
        return new GameStateIterator();
    }

    getStateTransformer() {
        return new StateTransformer();
    }
    
    getGameSetup() {
        return new GameSetup();
    }

    getIntermediaryHandler(intermediary: Intermediary) {
        return new IntermediaryHandler(intermediary);
    }

    getDefaultBotHandler() {
        return new DefaultBotHandler();
    }
}