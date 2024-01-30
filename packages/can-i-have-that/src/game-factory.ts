import { buildProviders } from './controllers/controllers.js';
import { eventHandler } from './event-handler.js';
import { GameHandlerParams } from './game-handler-params.js';
import { GameParams } from './game-params.js';
import { GameSetup } from './game-setup.js';
import { GameStates } from './game-states.js';
import { gameStateTransitions } from './game-state-transitions.js';
import { IntermediaryHandler } from './handlers/intermediary-handler.js';
import { LocalMaximumHandler } from './handlers/local-maximum-handler.js';
import { ResponseMessage } from './messages/response-message.js';
import { AbstractGameFactory, Intermediary, UnwrapProviders } from '@cards-ts/core';

export class GameFactory extends AbstractGameFactory<GameHandlerParams, GameParams, typeof GameStates, UnwrapProviders<ReturnType<typeof buildProviders>>, ResponseMessage> {
    protected override getGameStateTransitions() {
        return gameStateTransitions;
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
    
    override getEventHandler() {
        return eventHandler;
    }

    override getProviders() {
        return buildProviders();
    }
}
