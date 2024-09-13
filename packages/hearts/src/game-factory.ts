import { GameSetup } from './game-setup.js';
import { gameStateTransitions } from './game-state-transitions.js';
import { IntermediaryHandler } from './handlers/intermediary-handler.js';
import { buildProviders } from './controllers/controllers.js';
import { eventHandler } from './event-handler.js';
import { buildGameFactory } from '@cards-ts/core';
import { HeuristicHandler } from './handlers/heuristic-handler.js';

export const gameFactory = buildGameFactory(
    gameStateTransitions,
    eventHandler,
    new GameSetup(),
    intermediary => new IntermediaryHandler(intermediary),
    () => new HeuristicHandler(),
    buildProviders,
);
