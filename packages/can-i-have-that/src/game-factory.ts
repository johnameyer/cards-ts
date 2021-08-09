import { AbstractGameFactory, Intermediary, UnwrapProviders } from '@cards-ts/core';
import { buildProviders } from './controllers/controllers';
import { EventHandler } from './event-handler';
import { GameHandlerParams } from './game-handler-params';
import { GameParams } from './game-params';
import { GameSetup } from './game-setup';
import { GameStates } from './game-states';
import { GameStateTransitions } from './game-state-transitions';
import { IntermediaryHandler } from './handlers/intermediary-handler';
import { LocalMaximumHandler } from './handlers/local-maximum-handler';
import { ResponseMessage } from './messages/response-message';

export class GameFactory extends AbstractGameFactory<GameHandlerParams, GameParams, typeof GameStates, UnwrapProviders<ReturnType<typeof buildProviders>>, ResponseMessage, EventHandler> {
    protected override getGameStateTransitions() {
        return new GameStateTransitions();
    }
    
    override getGameSetup() {
        return new GameSetup();
    }

    override getIntermediaryHandler(intermediary: Intermediary) {
        return new IntermediaryHandler(intermediary);
    }

    override getDefaultBotHandler() {
        return new LocalMaximumHandler();
    }
    
    override getEventHandler(): EventHandler {
        return new EventHandler();
    }

    override getProviders() {
        return buildProviders();
    }
}
