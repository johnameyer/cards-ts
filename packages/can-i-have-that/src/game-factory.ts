import { buildProviders } from './controllers/controllers.js';
import { eventHandler } from './event-handler.js';
import { GameSetup } from './game-setup.js';
import { IntermediaryHandler } from './handlers/intermediary-handler.js';
import { LocalMaximumHandler } from './handlers/local-maximum-handler.js';
import { stateMachine } from './state-machine.js';
import { buildGameFactory } from '@cards-ts/core';
import { adapt } from '@cards-ts/state-machine';

export const gameFactory = buildGameFactory(
    adapt(stateMachine),
    eventHandler,
    new GameSetup(),
    intermediary => new IntermediaryHandler(intermediary),
    () => new LocalMaximumHandler(),
    buildProviders,
);
