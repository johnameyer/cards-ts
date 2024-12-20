import { STANDARD_STATES } from "@cards-ts/core";
import { expect } from "chai";
import { NestedMachine, handleRoundRobin } from "../src/index.js";
import { MockControllersWithPlayers, buildGameStateWithPlayers, resume } from "./helpers.js";
import { MockHandler, MockResponseMessage } from "./helpers/mock-handler.js";

describe('handleRoundRobin', () => {

    it('calls all handlers', () => {
        const transitions: NestedMachine<MockControllersWithPlayers> = handleRoundRobin({
            handler: 'choice',
            controller: controllers => controllers.turn,
            startingPosition: () => 0,
        });

        const first = new MockHandler(5);
        const second = new MockHandler(3);

        const gameState = buildGameStateWithPlayers([first, second]);

        expect(first.timesCalled).to.equals(0);
        expect(second.timesCalled).to.equals(0);

        resume(gameState, transitions);

        expect(gameState.state.waiting.waiting, 'waiting').to.deep.equals([0]);
        expect(first.timesCalled, 'first timesCalled').to.equals(1);
        expect(second.timesCalled, 'second timesCalled').to.equals(0);

        gameState.controllers.waiting.removePosition(0);

        resume(gameState, transitions);

        expect(gameState.state.waiting.waiting, 'waiting').to.deep.equals([1]);
        expect(first.timesCalled, 'first timesCalled').to.equals(1);
        expect(second.timesCalled, 'second timesCalled').to.equals(1);

        gameState.controllers.waiting.removePosition(1);

        resume(gameState, transitions);

        expect(first.timesCalled, 'first timesCalled').to.equals(1);
        expect(second.timesCalled, 'second timesCalled').to.equals(1);
        expect(gameState.state.state).to.equal(STANDARD_STATES.END_GAME);
    });

    it('starts with an offset', () => {
        const transitions: NestedMachine<MockControllersWithPlayers> = handleRoundRobin<MockControllersWithPlayers>({
            handler: 'choice',
            controller: controllers => controllers.turn,
            startingPosition: () => 1,
        });

        const first = new MockHandler(5);
        const second = new MockHandler(5);

        const gameState = buildGameStateWithPlayers([first, second]);

        expect(first.timesCalled).to.equals(0);
        expect(second.timesCalled).to.equals(0);

        resume(gameState, transitions);

        expect(first.timesCalled).to.equals(0);
        expect(second.timesCalled).to.equals(1);
        expect(gameState.state.waiting.waiting).to.deep.equals([1]);
    });
});
