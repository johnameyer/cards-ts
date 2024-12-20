import { expect } from 'chai';
import { handleSingle } from '../src/handle-single.js';
import { MockControllersWithPlayers, buildGameStateWithPlayers, resume } from './helpers.js';
import { MockHandler, MockResponseMessage } from './helpers/mock-handler.js';
import { STANDARD_STATES } from '@cards-ts/core';
import { NestedMachine } from '../src/machine.js';

describe('handleSingle', () => {
    it('calls a single handler', () => {
        const transitions: NestedMachine<MockControllersWithPlayers> = handleSingle({
            handler: 'choice',
            position: () => 0,
        });
        
        const mockHandler = new MockHandler(5);
        
        const gameState = buildGameStateWithPlayers([ mockHandler ]);
        
        expect(mockHandler.timesCalled).to.equals(0);
        
        resume(gameState, transitions);
        
        expect(mockHandler.timesCalled).to.equals(1);
        expect(gameState.state.waiting.waiting).to.deep.equals([ 0 ]);
        // TODO we are actually in the END_GAME state here (if we remained in the waiting state we risk calling the handler a second time)
        
        gameState.controllers.waiting.removePosition(0);
        
        resume(gameState, transitions);
        
        expect(gameState.state.state).to.equal(STANDARD_STATES.END_GAME);
    });
});


