import { AbstractGameFactory, Intermediary, Handler, GenericGameState, UnwrapProviders } from '@cards-ts/core';
import { buildProviders, GameControllers } from "./controllers/controllers";
import { EventHandler } from "./event-handler";
import { HandlerData } from "./game-handler";
import { GameHandlerParams } from "./game-handler-params";
import { GameParams } from "./game-params";
import { GameSetup } from "./game-setup";
import { GameStates } from "./game-states";
import { GameStateTransitions } from "./game-state-transitions";
import { HeuristicHandler } from "./handlers/heuristic-handler";
import { IntermediaryHandler } from "./handlers/intermediary-handler";
import { ResponseMessage } from "./messages/response-message";

export class GameFactory extends AbstractGameFactory<GameHandlerParams, GameParams, typeof GameStates, UnwrapProviders<ReturnType<typeof buildProviders>>, ResponseMessage, EventHandler> {
    protected getGameStateTransitions() {
        return new GameStateTransitions();
    }

    getGameSetup() {
        return new GameSetup();
    }

    getIntermediaryHandler(intermediary: Intermediary) {
        return new IntermediaryHandler(intermediary);
    }

    getDefaultBotHandler() {
        return new HeuristicHandler() as Handler<GameHandlerParams, HandlerData, ResponseMessage>;
    }

    getEventHandler(): EventHandler {
        return new EventHandler();
    }

    getProviders() {
        return buildProviders();
    }
}