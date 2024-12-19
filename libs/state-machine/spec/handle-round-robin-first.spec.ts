import { STANDARD_STATES } from "@cards-ts/core";
import { expect } from "chai";
import { NestedMachine, handleRoundRobinFirst } from "../src/index.js";
import { MockControllersWithPlayers, buildGameStateWithPlayers, resume } from "./helpers.js";
import { MockHandler } from "./helpers/mock-handler.js";

describe('handleRoundRobinFirst', () => {
    it('bails out when the first user responds', () => {
        const transitions: NestedMachine<MockControllersWithPlayers> = handleRoundRobinFirst({
            handler: 'choice',
            controller: controllers => controllers.turn,
            startingPosition: () => 0,
            hasResponded: controllers => controllers.mock.getFor() > 0,
        });

        const first = new MockHandler(0);
        const second = new MockHandler(1);
        const third = new MockHandler(2);

        const gameState = buildGameStateWithPlayers([first, second, third]);

        expect(first.timesCalled).to.equals(0);
        expect(second.timesCalled).to.equals(0);
        expect(third.timesCalled).to.equals(0);

        resume(gameState, transitions);

        expect(first.timesCalled).to.equals(1);
        expect(second.timesCalled).to.equals(0);
        expect(third.timesCalled).to.equals(0);
        expect(gameState.state.waiting.waiting).to.deep.equals([0]);

        gameState.controllers.waiting.removePosition(0);

        resume(gameState, transitions);

        expect(first.timesCalled).to.equals(1);
        expect(second.timesCalled).to.equals(1);
        expect(third.timesCalled).to.equals(0);
        expect(gameState.state.waiting.waiting).to.deep.equals([1]);

        gameState.controllers.mock.add(2); // TODO actually merge in event like normal
        gameState.controllers.waiting.removePosition(1);

        resume(gameState, transitions);

        expect(gameState.state.state).to.equal(STANDARD_STATES.END_GAME);
    });
});
