import { expect } from 'chai';
import { IntermediaryHandler } from '../src/index.js';
import { eventHandler } from '../src/event-handler.js';
import { GameSetup } from '../src/game-setup.js';
import { gameStateTransitions } from '../src/game-state-transitions.js';
import { GameParams } from '../src/game-params.js';
import { buildProviders } from '../src/controllers/controllers.js';
import { HeuristicHandler } from '../src/handlers/heuristic-handler.js';
import { GameHandler } from '../src/game-handler.js';
import { ArrayMessageHandler, buildGameFactory, DeckControllerProvider, HandlerChain, Rank } from '@cards-ts/core';
import { StatusMessage } from '../src/messages/status/index.js';

describe('game', () => {
    // TODO can we build this more simply i.e. deterministic deck controller?
    const mockProviders = () => ({
        ...buildProviders(),
        // TODO how to nicely have deterministic order by default in tests?
        deck: new DeckControllerProvider(1, false, false, Rank.ranks.slice(Rank.ranks.indexOf(Rank.NINE))), // note shouldShuffle false
    });

    const factory = buildGameFactory(
        gameStateTransitions,
        eventHandler,
        // TODO can we avoid specifying the setup and intermediary since they are not critical to the driver construction?
        new GameSetup(),
        intermediary => new IntermediaryHandler(intermediary),
        () => new HeuristicHandler(),
        mockProviders,
    );

    const params: GameParams = {
        ...new GameSetup().getDefaultParams(),
        maxScore: 4,
    };

    it('works as expected', async () => {
        const messageHandlers = Array.from({ length: 4 }, () => new ArrayMessageHandler<StatusMessage>());

        const gameHandler: () => GameHandler = () => new HeuristicHandler();

        // @ts-expect-error
        const players = Array.from(messageHandlers, messageHandler => new HandlerChain([ messageHandler, gameHandler() ]));

        const names = Array.from(messageHandlers, (_, i) => String.fromCharCode(65 + i));

        const driver = factory.getGameDriver(players, params, names);

        driver.resume();

        for(const messageHandler of messageHandlers) {
            expect(messageHandler.arr[0].type).to.equal('dealt-out-message');

            messageHandler.clear();
        }

        while(driver.getState().euchre.bidder === undefined) {
            driver.handleSyncResponses();
            driver.resume();
        }

        for(const messageHandler of messageHandlers) {
            expect(messageHandler.arr[0].type).to.equal('pass-message');
            expect(messageHandler.arr[1].type).to.equal('pass-message');
            expect(messageHandler.arr[2].type).to.equal('pass-message');
            expect(messageHandler.arr[3].type).to.equal('order-up-message');
            expect(messageHandler.arr[4].type).to.equal('trump-message');

            messageHandler.clear();
        }

        while(!driver.getState().tricksTaken.some(tricks => tricks > 0)) {
            driver.handleSyncResponses();
            driver.resume();
        }

        for(const messageHandler of messageHandlers) {
            expect(messageHandler.arr.at(-2)!.type).to.equal('won-trick-message');
            expect(messageHandler.arr.at(-1)!.type).to.equal('leads-message');

            messageHandler.clear();
        }

        // Make additional assertions
    });
});
