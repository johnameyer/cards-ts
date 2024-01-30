import { GameHandlerParams } from './game-handler-params.js';
import { GameParams } from './game-params.js';
import { GameSetup } from './game-setup.js';
import { GameStates } from './game-states.js';
import { gameStateTransitions } from './game-state-transitions.js';
import { HeuristicHandler } from './handlers/heuristic-handler.js';
import { IntermediaryHandler } from './handlers/intermediary-handler.js';
import { ResponseMessage } from './messages/response-message.js';
import { buildProviders } from './controllers/controllers.js';
import { eventHandler } from './event-handler.js';
import { AbstractGameFactory, Intermediary, UnwrapProviders } from '@cards-ts/core';

export class GameFactory extends AbstractGameFactory<GameHandlerParams, GameParams, typeof GameStates, UnwrapProviders<ReturnType<typeof buildProviders>>, ResponseMessage> {
    protected getGameStateTransitions() {
        return gameStateTransitions;
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

    getEventHandler() {
        return eventHandler;
    }

    getProviders() {
        return buildProviders();
    }
}
