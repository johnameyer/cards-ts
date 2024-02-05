import { expect } from 'chai';
import { NestedMachine, MockControllers, advance, buildGameState, sequence } from './helpers.js';

describe('sequence', () => {
    it('executes steps in order', () => {
        const transitions: NestedMachine<MockControllers> = sequence([
            controllers => controllers.count.add(1),
            controllers => controllers.count.add(2),
        ]);

        const gameState = buildGameState();

        expect(gameState.state.count).to.equals(0);
        advance(gameState, transitions); // enter inner state
        expect(gameState.state.count).to.equals(1);
        advance(gameState, transitions);
        expect(gameState.state.count).to.equals(3);
    });
});
