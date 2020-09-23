/*
    These are the minimum required exports of the game so that a game can be dynamically loaded.
    There will be a script eventually to test that you meet the contract.
 */

export { GameDriver } from './game-driver';
export { defaultParams } from './game-params';
export { HeuristicHandler as DefaultBotHandler } from './handlers/heuristic-handler';
export { IntermediaryHandler } from './handlers/intermediary-handler';