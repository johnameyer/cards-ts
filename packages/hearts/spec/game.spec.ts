import { expect } from 'chai';
import { IntermediaryHandler } from '../src/index.js';
import { eventHandler } from '../src/event-handler.js';
import { GameSetup } from '../src/game-setup.js';
import { gameStateTransitions } from '../src/game-state-transitions.js';
import { GameHandler } from '../src/game-handler.js';
import { GameParams } from '../src/game-params.js';
import { buildProviders } from '../src/controllers/controllers.js';
import { HeuristicHandler } from '../src/handlers/heuristic-handler.js';
import { PassResponseMessage } from '../src/messages/response/pass-response-message.js';
import { PassingMessage } from '../src/messages/status/passing-message.js';
import { valueOfCard } from '../src/util/value-of-card.js';
import { followsTrick } from '../src/util/follows-trick.js';
import { PlayedMessage } from '../src/messages/status/played-message.js';
import { ArrayMessageHandler, buildGameFactory, Card, DeckControllerProvider, EndRoundMessage, HandlerChain, LeadsMessage, Message, PlayCardResponseMessage } from '@cards-ts/core';
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
        () => new HeuristicHandler(),
        mockProviders,
    );

    const params: GameParams = {
        ...new GameSetup().getDefaultParams(),
        maxScore: 26,
    };

    it('works as expected', async () => {
        const messageHandlers = Array.from({length: 4}, () => new ArrayMessageHandler<StatusMessage>());

        const gameHandler: () => GameHandler = () => ({
            handlePass: (state, responses) => {
                responses.push(new PassResponseMessage(state.hand.slice(0, 3)));
            },
            handleTurn: (state, responses) => {
                // TODO create DeterministicHandler (simpler logic than heuristic handler)
                const followingTrick = state.hand.filter(card => followsTrick(state.trick.currentTrick, card, state.hand));
                if(state.trickPoints.every(points => points === 0)) {
                    const pointless = (followingTrick.length ? followingTrick : state.hand).filter(card => valueOfCard(card) === 0);
                    responses.push(new PlayCardResponseMessage((pointless.length ? pointless : followingTrick)[0]));
                }
                responses.push(new PlayCardResponseMessage((followingTrick.length ? followingTrick : state.hand)[0]));
            },
        });

        // @ts-expect-error
        const players = Array.from(messageHandlers, messageHandler => new HandlerChain([ messageHandler, gameHandler() ]));

        const names = Array.from(messageHandlers, (_, i) => String.fromCharCode(65 + i));

        const driver = factory.getGameDriver(players, params, names);

        driver.resume();

        for(const messageHandler of messageHandlers) {
            expect(messageHandler.arr[0].type).to.equal('dealt-out-message');
            expect(messageHandler.arr[1]).to.deep.equal(new PassingMessage(3, 1, 4));

            messageHandler.clear();
        }

        expect(driver.getState().completed).to.be.false;

        driver.handleSyncResponses();
        driver.resume();

        for(const i in messageHandlers) {
            const messageHandler = messageHandlers[i];

            expect(messageHandler.arr[0].type).to.equal('passed-message');
            expect(messageHandler.arr[1]).to.deep.equal(new LeadsMessage('B'));

            if(i !== '1') { // B
                expect(messageHandler.arr[2]).to.deep.equal(new PlayedMessage('B', Card.fromString('2C')));
            }

            messageHandler.clear();
        }

        expect(driver.getState().completed).to.be.false;

        driver.handleSyncResponses();
        driver.resume();

        for(const i in messageHandlers) {
            const messageHandler = messageHandlers[i];
            if(i !== '2') { // C
                expect(messageHandler.arr[0]).to.deep.equal(new PlayedMessage('C', Card.fromString('3C', 0)));
            }

            messageHandler.clear();
        }

        expect(driver.getState().completed).to.be.false;

        driver.handleSyncResponses();
        driver.resume();

        for(const i in messageHandlers) {
            const messageHandler = messageHandlers[i];
            if(i !== '3') { // D
                expect(messageHandler.arr[0]).to.deep.equal(new PlayedMessage('D', Card.fromString('4C', 0)));
            }
            messageHandler.clear();
        }

        expect(driver.getState().completed).to.be.false;

        driver.handleSyncResponses();
        driver.resume();

        for(const i in messageHandlers) {
            const messageHandler = messageHandlers[i];
            if(i !== '0') { // A
                expect(messageHandler.arr[0]).to.deep.equal(new PlayedMessage('A', Card.fromString('5C', 0)));
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
            expect(messageHandler.arr.at(-1)?.type).to.equal('end-round-message');

            expect((messageHandler.arr.at(-1) as EndRoundMessage).scores.reduce((a, b) => a + b, 0) % 26).to.equal(0);
        }
    });
});
