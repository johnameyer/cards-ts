import { expect } from 'chai';
import { NestedMachine, sequence } from '../src/index.js';
import { MockControllers, buildGameState, advance } from './helpers.js';

describe('sequence', () => {
    it('executes steps in order', () => {
        const transitions: NestedMachine<MockControllers> = sequence([
            controllers => controllers.mock.add(1),
            controllers => controllers.mock.add(2),
        ]);

        const gameState = buildGameState();

        expect(gameState.state.mock).to.equals(0);
        advance(gameState, transitions); // enter inner state
        expect(gameState.state.mock).to.equals(1);
        advance(gameState, transitions);
        expect(gameState.state.mock).to.equals(3);
    });
});
