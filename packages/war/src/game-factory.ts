import { AbstractGameFactory, Intermediary, UnwrapProviders } from '@cards-ts/core';
import { GameHandlerParams } from './game-handler-params';
import { GameParams } from './game-params';
import { GameSetup } from './game-setup';
import { GameStates } from './game-states';
import { DefaultBotHandler } from './handlers/default-bot-handler';
import { IntermediaryHandler } from './handlers/intermediary-handler';
import { ResponseMessage } from './messages/response-message';
import { EventHandler } from './event-handler';
import { buildProviders } from './controllers/controllers';
import { GameStateTransitions } from './game-state-transitions';

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
