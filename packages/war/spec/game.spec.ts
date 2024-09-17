import { expect } from 'chai';
import { IntermediaryHandler } from '../src/index.js';
import { eventHandler } from '../src/event-handler.js';
import { GameSetup } from '../src/game-setup.js';
import { gameStateTransitions } from '../src/game-state-transitions.js';
import { DefaultBotHandler } from '../src/handlers/default-bot-handler.js';
import { GameHandler } from '../src/game-handler.js';
import { GameParams } from '../src/game-params.js';
import { buildProviders } from '../src/controllers/controllers.js';
import { ArrayMessageHandler, buildGameFactory, Card, DeckControllerProvider, HandlerChain } from '@cards-ts/core';
import { FlippedMessage, StalemateMessage, WonBattleMessage } from '../src/messages/status/index.js';
import { FlipResponseMessage } from '../src/messages/response/flip-response-message.js';
import { StatusMessage } from '../../can-i-have-that/src/messages/status-message.js';

describe('game', () => {
    // TODO can we build this more simply i.e. deterministic deck controller?
    const mockProviders = () => ({
        ...buildProviders(),
        deck: new DeckControllerProvider(1, false, false), // note shouldShuffle false
    });

    const factory = buildGameFactory(
        gameStateTransitions,
        eventHandler,
        // TODO can we avoid specifying the setup and intermediary since they are not critical to the driver construction?
        new GameSetup(),
        intermediary => new IntermediaryHandler(intermediary),
        () => new DefaultBotHandler(),
        mockProviders,
    );

    it('works as expected', async () => {
        const messageHandlers = Array.from({length: 2}, () => new ArrayMessageHandler<StatusMessage>());

        const gameHandler: () => GameHandler =  () => ({
            handleFlip: (_state, responses) => {
                responses.push(new FlipResponseMessage());
            },
        });

        // @ts-expect-error
        const players = Array.from(messageHandlers, messageHandler => new HandlerChain([ messageHandler, gameHandler() ]));

        const params: GameParams = {
            ...new GameSetup().getDefaultParams(),
            maxBattles: 2,
        };

        const names = Array.from(messageHandlers, (_, i) => String.fromCharCode(65 + i));

        const driver = factory.getGameDriver(players, params, names);

        driver.resume();

        for(const messageHandler of messageHandlers) {
            expect(messageHandler.arr).to.be.empty;
        }

        expect(driver.getState().completed).to.be.false;

        driver.handleSyncResponses();
        driver.resume();

        const firstFlips = [
            new FlippedMessage('A', Card.fromString('2D', 0)), // TODO can we avoid specifying the deck number?
            new FlippedMessage('B', Card.fromString('3D', 0)),
            new WonBattleMessage('B'),
        ];


        for(const messageHandler of messageHandlers) {
            expect(messageHandler.arr).to.deep.include.ordered.members(firstFlips);
            messageHandler.clear();
        }

        expect(driver.getState().completed).to.be.false;

        driver.handleSyncResponses();
        driver.resume();

        const secondFlips = [
            new FlippedMessage('A', Card.fromString('4D', 0)),
            new FlippedMessage('B', Card.fromString('5D', 0)),
            new WonBattleMessage('B'),
            new StalemateMessage(),
        ];

        for(const messageHandler of messageHandlers) {
            expect(messageHandler.arr).to.deep.include.ordered.members(secondFlips);
            messageHandler.clear();
        }

        expect(driver.getState().completed).to.be.true;

        // TODO test multiflipping - would require more test setup
    });
});
