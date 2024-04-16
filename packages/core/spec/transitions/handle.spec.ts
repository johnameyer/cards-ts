import { expect } from 'chai';
import { Machine, NestedMachine, STANDARD_STATES, handleRoundRobin, handleSingle } from '../../src/index.js';
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

describe('handleRoundRobin', () => {
    
    it('calls all handlers', () => {
        const transitions: NestedMachine<MockControllersWithPlayers> = handleRoundRobin({
            handler: 'choice',
            controller: controllers => controllers.turn,
            startingPosition: () => 0,
        });

        const first = new MockHandler();
        first.setResponse(new MockResponseMessage(5));

        const second = new MockHandler();
        second.setResponse(new MockResponseMessage(5));

        const gameState = buildGameStateWithPlayers([ first, second ]);
        
        expect(first.timesCalled).to.equals(0);
        expect(second.timesCalled).to.equals(0);
        
        resume(gameState, transitions);
        
        expect(gameState.state.waiting.waiting, 'waiting').to.deep.equals([ 0 ]);
        expect(first.timesCalled, 'first timesCalled').to.equals(1);
        expect(second.timesCalled, 'second timesCalled').to.equals(0);

        gameState.controllers.waiting.removePosition(0);

        resume(gameState, transitions);

        expect(gameState.state.waiting.waiting, 'waiting').to.deep.equals([ 1 ]);
        expect(first.timesCalled, 'first timesCalled').to.equals(1);
        expect(second.timesCalled, 'second timesCalled').to.equals(1);

        gameState.controllers.waiting.removePosition(1);

        resume(gameState, transitions);

        expect(first.timesCalled, 'first timesCalled').to.equals(1);
        expect(second.timesCalled, 'second timesCalled').to.equals(1);
        expect(gameState.state.state).to.equal(STANDARD_STATES.END_GAME);
    });
    
    it('bails out', () => {
        const transitions: NestedMachine<MockControllersWithPlayers> = handleRoundRobin({
            handler: 'choice',
            controller: controllers => controllers.turn,
            startingPosition: () => 0,
            breakingIf: controllers => controllers.turn.get() > 0, // TODO note that we should typically use a different parameter
        });

        const first = new MockHandler();
        first.setResponse(new MockResponseMessage(5));

        const second = new MockHandler();
        second.setResponse(new MockResponseMessage(5));

        const gameState = buildGameStateWithPlayers([ first, second ]);
        
        expect(first.timesCalled).to.equals(0);
        expect(second.timesCalled).to.equals(0);
        
        resume(gameState, transitions);
        
        expect(first.timesCalled).to.equals(1);
        expect(second.timesCalled).to.equals(0);
        expect(gameState.state.waiting.waiting).to.deep.equals([ 0 ]);

        gameState.controllers.waiting.removePosition(0);

        resume(gameState, transitions);

        expect(first.timesCalled).to.equals(1);
        expect(second.timesCalled).to.equals(0);
        expect(gameState.state.state).to.equal(STANDARD_STATES.END_GAME);
    });

    it('starts with an offset', () => {
        const transitions: NestedMachine<MockControllersWithPlayers> = handleRoundRobin({
            handler: 'choice',
            controller: controllers => controllers.turn,
            startingPosition: () => 1,
            breakingIf: controllers => controllers.mock.getFor() > 0,
        });

        const first = new MockHandler();
        first.setResponse(new MockResponseMessage(5));

        const second = new MockHandler();
        second.setResponse(new MockResponseMessage(5));

        const gameState = buildGameStateWithPlayers([ first, second ]);
        
        expect(first.timesCalled).to.equals(0);
        expect(second.timesCalled).to.equals(0);
        
        resume(gameState, transitions);
        
        expect(first.timesCalled).to.equals(0);
        expect(second.timesCalled).to.equals(1);
        expect(gameState.state.waiting.waiting).to.deep.equals([ 1 ]);
    });
});

