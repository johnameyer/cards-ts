import { GameSetup } from './game-setup.js';
import { DefaultBotHandler } from './handlers/default-bot-handler.js';
import { IntermediaryHandler } from './handlers/intermediary-handler.js';
import { eventHandler } from './event-handler.js';
import { buildProviders } from './controllers/controllers.js';
import { gameStateTransitions } from './game-state-transitions.js';
import { buildGameFactory } from '@cards-ts/core';

export const gameFactory = buildGameFactory(
    gameStateTransitions,
    eventHandler,
    new GameSetup(),
    intermediary => new IntermediaryHandler(intermediary),
    () => new DefaultBotHandler(),
    buildProviders
);