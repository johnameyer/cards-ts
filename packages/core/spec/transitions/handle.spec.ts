import { expect } from 'chai';
import { Machine, STANDARD_STATES, handleSingle } from '../../src/index.js';
import { MockHandler, MockResponseMessage } from '../handlers/mock-handler.js';
import { MockControllersWithPlayers, buildGameStateWithPlayers, resume } from './helpers.js';

describe('handleSingle', () => {
    it('calls a single handler', () => {
        const transitions: Machine<MockControllersWithPlayers> = handleSingle({
            handler: 'choice',
            position: () => 0,
        });

        const mockHandler = new MockHandler();
        mockHandler.setResponse(new MockResponseMessage(5));

        const gameState = buildGameStateWithPlayers([ mockHandler ]);

        expect(mockHandler.timesCalled).to.equals(0);

        resume(gameState, transitions);

        expect(mockHandler.timesCalled).to.equals(1);
        expect(gameState.state.waiting.waiting).to.deep.equals([ 0 ]);
        expect(gameState.state.state).to.not.equal(STANDARD_STATES.END_GAME); // TODO use completed?

        gameState.controllers.waiting.removePosition(0);

        resume(gameState, transitions);

        expect(gameState.state.state).to.equal(STANDARD_STATES.END_GAME);
    });
});

// describe('handle', () => {

/*
 *     it('calls all handlers', () => {
 *         const transitions: Machine<MockControllersWithPlayers> = handle({
 *             handler: 'choice',
 *             mode: 'round-robin',
 *             startingPosition: () => 0,
 *         });
 *     });
 */

/*
 *     it('bails out', () => {
 *         const transitions: Machine<MockControllersWithPlayers> = handle({
 *             handler: 'choice',
 *             mode: 'round-robin',
 *             startingPosition: () => 0,
 *             breakingIf: controllers => controllers.count.getFor() > 0,
 *         });
 *     });
 * });
 */
