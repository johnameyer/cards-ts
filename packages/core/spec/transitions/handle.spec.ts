import { expect } from 'chai';
import { Machine, MockControllersWithPlayers, buildGameStateWithPlayers, handleSingle, resume } from './helpers.js';
import { MockHandler } from '../mock-handler.js';

describe('handleSingle', () => {
    it('calls a single handler', () => {
        const transitions: Machine<MockControllersWithPlayers> = handleSingle({
            handler: 'choice',
            position: () => 0,
        });

        const mockHandler = new MockHandler();

        const gameState = buildGameStateWithPlayers([mockHandler]);

        expect(mockHandler.get()).to.equals(0);

        resume(gameState, transitions);

        expect(mockHandler.get()).to.equals(1);
        expect(gameState.state.waiting.waiting).to.deep.equals([0]);

        gameState.controllers.waiting.removePosition(0);

        // resume(gameState, transitions);
        
        // expect(gameState.state.count).to.equals(5);
    });
});

// describe('handle', () => {

//     it('calls all handlers', () => {
//         const transitions: Machine<MockControllersWithPlayers> = handle({
//             handler: 'choice',
//             mode: 'round-robin',
//             startingPosition: () => 0,
//         });
//     });

//     it('bails out', () => {
//         const transitions: Machine<MockControllersWithPlayers> = handle({
//             handler: 'choice',
//             mode: 'round-robin',
//             startingPosition: () => 0,
//             breakingIf: controllers => controllers.count.getFor() > 0,
//         });
//     });
// });
