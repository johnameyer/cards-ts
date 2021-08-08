import { AbstractGameFactory, Intermediary, UnwrapProviders } from "@cards-ts/core";
import { GameHandlerParams } from "./game-handler-params";
import { GameParams } from "./game-params";
import { GameSetup } from "./game-setup";
import { GameStates } from "./game-states";
import { GameStateTransitions } from "./game-state-transitions";
import { HeuristicHandler } from "./handlers/heuristic-handler";
import { IntermediaryHandler } from "./handlers/intermediary-handler";
import { ResponseMessage } from "./messages/response-message";
import { buildProviders } from "./controllers/controllers";
import { EventHandler } from "./event-handler";

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
        return new HeuristicHandler();
    }

    getEventHandler(): EventHandler {
        return new EventHandler();
    }

    getProviders() {
        return buildProviders();
    }
}