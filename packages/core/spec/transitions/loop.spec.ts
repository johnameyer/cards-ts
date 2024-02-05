import { expect } from 'chai';
import { NestedMachine, MockControllers, loop, resume, buildGameState } from './helpers.js';

describe('loop', () => {
    it('continues until condition is no longer true', () => {
        const transitions: NestedMachine<MockControllers> = loop({
            id: 'loop',
            condition: controllers => controllers.count.getFor() < 5,
            run: controllers => controllers.count.add(1),
        });

        const gameState = buildGameState();

        expect(gameState.state.count).to.equals(0);
        resume(gameState, transitions);
        expect(gameState.state.count).to.equals(5);
    });
});
