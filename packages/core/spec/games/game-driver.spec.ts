import 'mocha';
import { expect } from 'chai';
import { ControllerState, ControllersProviders, DefaultControllers, EventHandler, EventHandlerInterface, GameDriver, GenericGameState, GenericGameStateTransitions, STANDARD_STATES, SystemHandlerParams, buildEventHandler } from '../../src/browser-index.js';
import { MockHandler, MockResponseMessage, MockHandlerParams } from '../handlers/mock-handler.js';
import { MockController, MockControllerProvider } from '../controllers/mock-controller.js';
import { MockAsyncHandler } from '../handlers/mock-async-handler.js';
import { buildDefaultProviders } from '../../src/games/default-controllers.js';
import { GenericHandlerProxy } from '../../src/games/generic-handler-controller.js';
import { mockHandlerProxy } from './mock-handler-proxy.js';


type GameParams = {};

const states = {
    ...STANDARD_STATES,

    WAIT_FOR_CHOICE: 'WAIT_FOR_CHOICE',
} as const;

type State = typeof states;

type ResponseMessage = MockResponseMessage;

type Handles = {

} & SystemHandlerParams;

type Controllers = {
    mock: MockController,
} & DefaultControllers<{}, State, ResponseMessage, MockHandlerParams>;

const transitions: GenericGameStateTransitions<typeof states, Controllers> = {
    START_GAME: controllers => {
        controllers.state.set('WAIT_FOR_CHOICE');
    },
    WAIT_FOR_CHOICE: controllers => {
        controllers.players.handlerCallFirst('choice');
        controllers.state.set('END_GAME');
    },
    END_GAME: controllers => {
        controllers.completed.complete();
    },
};

function buildMockProviders(proxy?: GenericHandlerProxy<MockResponseMessage, MockHandlerParams>) {
    if(!proxy) {
        proxy = mockHandlerProxy([]) as any;
    }
    return { mock: new MockControllerProvider(), ...buildDefaultProviders({}, [], proxy as any) } as any as ControllersProviders<Controllers & DefaultControllers<GameParams, typeof states, ResponseMessage, Handles & SystemHandlerParams>>;
}


function buildDefaultState(proxy?: GenericHandlerProxy<MockResponseMessage, MockHandlerParams>) {
    return new GenericGameState(buildMockProviders(proxy));
}

function buildMockGameDriver(handlerProxy: GenericHandlerProxy<MockResponseMessage, MockHandlerParams>, transitions: GenericGameStateTransitions<any, Controllers>, eventHandler: EventHandlerInterface<Controllers, MockResponseMessage>, state: ControllerState<Controllers>) {
    const gameState = new GenericGameState(buildMockProviders(handlerProxy), state);

    return new GameDriver(handlerProxy, gameState, transitions, eventHandler);
}

const eventHandler = buildEventHandler<Controllers, MockResponseMessage>({
    canRespond: {
        'mock-response': [ EventHandler.isWaiting('waiting'), (controller, sourceHandler, incomingEvent) => incomingEvent.value > 0 ],
    },
    validateEvent: {
        'mock-response': (controller, sourceHandler, incomingEvent) => new MockResponseMessage(incomingEvent.value),
    },
    merge: {
        'mock-response': (controllers, sourceHandler, incomingEvent) => {
            controllers.mock.add(incomingEvent.value);
            controllers.waiting.set((controllers.waiting.get().waiting as number) - 1);
        },
    },
});

describe('GameDriver', () => {
    describe('#isWaitingOnPlayer', () => {
        const handlerProxy = mockHandlerProxy([ new MockHandler() ]) as any;

        it('with no players waiting', () => {
            const state = buildDefaultState();
            state.controllers.waiting.set([]);
            const gameDriver = buildMockGameDriver(handlerProxy, transitions, eventHandler, state.state);

            expect(gameDriver.isWaitingOnPlayer()).to.be.false;
        });

        it('with players waiting', () => {
            const state = buildDefaultState();
            state.controllers.waiting.set([ 0 ]);
            const gameDriver = buildMockGameDriver(handlerProxy, transitions, eventHandler, state.state);

            expect(gameDriver.isWaitingOnPlayer()).to.be.true;
        });
    });
    
    describe('#handleEvent', () => {
        const handlerProxy = mockHandlerProxy([ new MockHandler() ]) as any;

        it('should reject events if not valid', () => {
            const state = buildDefaultState();
            const gameDriver = buildMockGameDriver(handlerProxy, transitions, eventHandler, state.state);

            expect(gameDriver.getState().mock).to.equal(0);

            gameDriver.handleEvent(0, new MockResponseMessage(-1), undefined);

            expect(gameDriver.getState().mock).to.equal(0);
        });

        it('should merge valid events', () => {
            const state = buildDefaultState();
            state.controllers.waiting.set([ 0 ]);
            const gameDriver = buildMockGameDriver(handlerProxy, transitions, eventHandler, state.state);

            expect(gameDriver.getState().mock).to.equal(0);

            gameDriver.handleEvent(0, new MockResponseMessage(5), undefined);

            expect(gameDriver.getState().mock).to.equal(5);
        });
    });

    describe('#resume', () => {
        it('should pause when waiting for player response', () => {
            const handler = new MockAsyncHandler();
            const handlerProxy = mockHandlerProxy([ handler ]) as any;
            const state = buildDefaultState(handlerProxy);
            const gameDriver = buildMockGameDriver(handlerProxy, transitions, eventHandler, state.state);

            gameDriver.resume();

            expect(handler.timesCalled).to.equal(1);
            expect(gameDriver.getState().completed).to.be.false;
            expect(gameDriver.getState().mock).to.equal(0);
        });
    });

    describe('#start', () => {        
        it('should play through with synchronous handlers', async () => {
            const handler = new MockHandler();
            const handlerProxy = mockHandlerProxy([ handler ]) as any;
            const state = buildDefaultState(handlerProxy);
            const gameDriver = buildMockGameDriver(handlerProxy, transitions, eventHandler, state.state);

            handler.setResponse(new MockResponseMessage(5));

            await gameDriver.start();

            expect(handler.timesCalled).to.equal(1);
            expect(gameDriver.getState().mock).to.equal(5);
            expect(gameDriver.getState().completed).to.equal(true);
        });

        it('should play through with asynchronous handlers', async () => {
            const handler = new MockAsyncHandler();
            const handlerProxy = mockHandlerProxy([ handler ]) as any;
            const state = buildDefaultState(handlerProxy);
            const gameDriver = buildMockGameDriver(handlerProxy, transitions, eventHandler, state.state);

            const gameComplete = gameDriver.start();

            expect(gameDriver.getState().completed).to.be.false;
            expect(gameDriver.getState().mock).to.equal(0);

            handler.respond((async () => {
                return new MockResponseMessage(5);
            })()); // TODO nicer

            await gameComplete;

            expect(handler.timesCalled).to.equal(1);
            expect(gameDriver.getState().mock).to.equal(5);
            expect(gameDriver.getState().completed).to.equal(true);
        });

        it('should accept first response first', async () => {
            const playerOne = new MockAsyncHandler();
            const playerTwo = new MockAsyncHandler();
            const handlerProxy = mockHandlerProxy([ playerOne, playerTwo ]) as any;
            const state = buildDefaultState(handlerProxy);
            const gameDriver = buildMockGameDriver(handlerProxy, transitions, eventHandler, state.state);

            const gameComplete = gameDriver.start();

            expect(gameDriver.getState().completed).to.be.false;
            expect(gameDriver.getState().mock).to.equal(0);


            playerOne.respond((async () => {
                await new Promise(resolve => setTimeout(resolve, 20));
                return new MockResponseMessage(1);
            })());

            playerTwo.respond((async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                return new MockResponseMessage(2);
            })());

            await gameComplete;

            expect(playerOne.timesCalled).to.equal(1);
            expect(playerTwo.timesCalled).to.equal(1);
            expect(gameDriver.getState().mock).to.equal(2);
            expect(gameDriver.getState().completed).to.equal(true);
        });
    });
});
