import { AbstractGameFactory, Intermediary, UnwrapProviders } from '@cards-ts/core';
import { GameHandlerParams } from './game-handler-params.js';
import { GameParams } from './game-params.js';
import { GameSetup } from './game-setup.js';
import { GameStates } from './game-states.js';
import { DefaultBotHandler } from './handlers/default-bot-handler.js';
import { IntermediaryHandler } from './handlers/intermediary-handler.js';
import { ResponseMessage } from './messages/response-message.js';
import { EventHandler } from './event-handler.js';
import { buildProviders } from './controllers/controllers.js';
import { GameStateTransitions } from './game-state-transitions.js';

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
        return new DefaultBotHandler();
    }

    getEventHandler(): EventHandler {
        return new EventHandler();
    }

    getProviders() {
        return buildProviders();
    }
}
