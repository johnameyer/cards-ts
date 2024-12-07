import { expect, use } from 'chai';
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";
import { IntermediaryHandler } from '../src/index.js';
import { eventHandler } from '../src/event-handler.js';
import { GameSetup } from '../src/game-setup.js';
import { gameStateTransitions } from '../src/game-state-transitions.js';
import { GameHandler } from '../src/game-handler.js';
import { GameParams } from '../src/game-params.js';
import { buildProviders } from '../src/controllers/controllers.js';
import { LocalMaximumHandler } from '../src/handlers/local-maximum-handler.js';
import { StartRoundMessage } from '../src/messages/status/start-round-message.js';
import { PickupMessage } from '../src/messages/status/pickup-message.js';
import { StatusMessage } from '../src/messages/status-message.js';
import { Message, PickupMessage as PublicPickupMessage, ArrayMessageHandler, buildGameFactory, Card, DeckControllerProvider, DiscardMessage, HandlerChain } from '@cards-ts/core';

use(jestSnapshotPlugin());

describe('game', () => {
    // TODO can we build this more simply i.e. deterministic deck controller?
    const mockProviders = () => ({
        ...buildProviders(),
        deck: new DeckControllerProvider(2, false, true), // note shouldShuffle false
    });

    const factory = buildGameFactory(
        gameStateTransitions,
        eventHandler,
        // TODO can we avoid specifying the setup and intermediary since they are not critical to the driver construction?
        new GameSetup(),
        intermediary => new IntermediaryHandler(intermediary),
        () => new LocalMaximumHandler(),
        mockProviders,
    );

    const params: GameParams = {
        ...new GameSetup().getDefaultParams(),
        rounds: [[ 3, 3 ], [ 3, 4 ], [ 4, 4 ]],
    };

    it('works as expected', async () => {
        const messageHandlers = Array.from({ length: 4 }, () => new ArrayMessageHandler<StatusMessage>());

        const gameHandler: () => GameHandler = () => new LocalMaximumHandler();

        // @ts-expect-error
        const players = Array.from(messageHandlers, messageHandler => new HandlerChain([ messageHandler, gameHandler() ]));

        const names = Array.from(messageHandlers, (_, i) => String.fromCharCode(65 + i));

        const driver = factory.getGameDriver(players, params, names);

        driver.resume();

        for(const messageHandler of messageHandlers) {
            expect(messageHandler.arr[0]).to.deep.equal(new StartRoundMessage([ 3, 3 ]));
            expect(messageHandler.arr[1].type).to.equal('dealt-out-message');
            expect(messageHandler.arr[2]).to.deep.equal(new DiscardMessage(Card.fromString('4H', 0)));

            messageHandler.clear();
        }

        expect(driver.getState().completed).to.be.false;

        driver.handleSyncResponses();
        driver.resume();

        driver.handleSyncResponses();
        driver.resume();

        for(const i in messageHandlers) {
            const messageHandler = messageHandlers[i];

            if(i !== '2') { // C
                expect(messageHandler.arr[0]).to.deep.equal(new PublicPickupMessage(Card.fromString('4H', 0), 'C', true));
            } else {
                expect(messageHandler.arr[0]).to.deep.equal(new PickupMessage(Card.fromString('4H', 0), Card.fromString('5H', 0)));
            }

            messageHandler.clear();
        }

        expect(driver.getState().completed).to.be.false;

        while(!driver.getState().completed) {
            driver.handleSyncResponses();
            driver.resume();
        }

        for(const i in messageHandlers) {
            const messageHandler = messageHandlers[i];
            expect(messageHandler.arr.filter(message => message.type === 'start-round-message').length).to.equal(2);
            expect(messageHandler.arr.filter(message => message.type === 'end-round-message').length).to.equal(3);
            expect(messageHandler.arr.at(-1)?.type).to.equal('end-round-message');
        }
    });

    it('has a matching snapshot', async () => {
        const messageHandlers = Array.from({length: 4}, () => new ArrayMessageHandler<StatusMessage>());

        const gameHandler: () => GameHandler = () => new LocalMaximumHandler();

        // @ts-expect-error
        const players = Array.from(messageHandlers, messageHandler => new HandlerChain([ messageHandler, gameHandler() ]));

        const names = Array.from(messageHandlers, (_, i) => String.fromCharCode(65 + i));

        const driver = factory.getGameDriver(players, params, names);


        while(!driver.getState().completed) {
            driver.handleSyncResponses();
            driver.resume();
        }

        // TODO record the responses separately, capture messages with who they were delivered to (i.e. observer)
        for(const i in messageHandlers) {
            const messageHandler = messageHandlers[i];

            expect(messageHandler.arr.map(msg => Message.defaultTransformer(msg.components))).toMatchSnapshot();
        }
    });
});
