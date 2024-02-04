import { expect } from 'chai';
import { Machine, MockControllers, advance, buildGameState, sequence, single } from './helpers.js';

describe('sequence', () => {
    it('executes steps in order', () => {
        const transitions: Machine<MockControllers> = sequence([
            single('one', controllers => controllers.count.add(1)),
            single('two', controllers => controllers.count.add(2)),
        ]);

        const gameState = buildGameState();

        expect(gameState.state.count).to.equals(0);
        advance(gameState, transitions);
        expect(gameState.state.count).to.equals(1);
        advance(gameState, transitions);
        expect(gameState.state.count).to.equals(3);
    });
});
