import { buildProviders } from './controllers/controllers.js';
import { EventHandler } from './event-handler.js';
import { HandlerData } from './game-handler.js';
import { GameHandlerParams } from './game-handler-params.js';
import { GameParams } from './game-params.js';
import { GameSetup } from './game-setup.js';
import { GameStates } from './game-states.js';
import { GameStateTransitions } from './game-state-transitions.js';
import { HeuristicHandler } from './handlers/heuristic-handler.js';
import { IntermediaryHandler } from './handlers/intermediary-handler.js';
import { ResponseMessage } from './messages/response-message.js';
import { AbstractGameFactory, Intermediary, Handler, UnwrapProviders } from '@cards-ts/core';

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
