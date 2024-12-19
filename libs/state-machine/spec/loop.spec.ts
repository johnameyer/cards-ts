import { expect } from 'chai';
import { NestedMachine, loop } from '../src/index.js';
import { MockControllers, buildGameState, resume } from './helpers.js';

describe('loop', () => {
    it('continues until condition is no longer true', () => {
        const transitions: NestedMachine<MockControllers> = loop({
            id: 'loop',
            breakingIf: controllers => controllers.mock.getFor() >= 5,
            run: controllers => controllers.mock.add(1),
        });

        const gameState = buildGameState();

        expect(gameState.state.mock).to.equals(0);
        resume(gameState, transitions);
        expect(gameState.state.mock).to.equals(5);
    });
});
