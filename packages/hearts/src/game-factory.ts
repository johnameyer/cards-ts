import { GameSetup } from './game-setup.js';
import { gameStateTransitions } from './game-state-transitions.js';
import { IntermediaryHandler } from './handlers/intermediary-handler.js';
import { buildProviders } from './controllers/controllers.js';
import { eventHandler } from './event-handler.js';
import { HeuristicHandler } from './handlers/heuristic-handler.js';
import { stateMachine } from './state-machine.js';
import { buildGameFactory } from '@cards-ts/core';
import { adapt } from '@cards-ts/state-machine';

export const gameFactory = buildGameFactory(
    adapt(stateMachine) as typeof gameStateTransitions,
    eventHandler,
    new GameSetup(),
    intermediary => new IntermediaryHandler(intermediary),
    () => new HeuristicHandler(),
    buildProviders,
);
