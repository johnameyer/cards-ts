import 'mocha';
import { ControllersProviders, DefaultControllers, EventHandlerInterface, GameDriver, GenericGameState, GenericGameStateTransitions, SystemHandlerParams } from '../../src/index.js';
import { buildDefaultProviders } from '../../src/games/default-controllers.js';
import { GenericHandlerProxy } from '../../src/games/generic-handler-controller.js';
import { MockResponseMessage, Params } from '../handlers/mock-handler.js';
import { mockHandlerProxy } from './mock-handler-proxy.js';
import { MockController } from '../controllers/mock-controller.js';


type Controllers = {
    mock: MockController,
}

function buildMockGameDriver(handlerProxy: GenericHandlerProxy<MockResponseMessage, Params>, transitions: GenericGameStateTransitions<any, Controllers>, eventHandler: EventHandlerInterface<Controllers, MockResponseMessage>) {
    const providers = { ...this.getProviders(), ...buildDefaultProviders({}, [], handlerProxy) } as ControllersProviders<Controllers & DefaultControllers<GameParams, State, ResponseMessage, Handles & SystemHandlerParams>>;
    const gameState = new GenericGameState(providers, state);

    return new GameDriver(handlerProxy, gameState, transitions, eventHandler);
}

describe('GameDriver', () => {
    describe('#handleEvent', () => {
        it('should reject events based on event handler', () => {
            const handlerProxy = mockHandlerProxy();
            const gameDriver = buildMockGameDriver(handlerProxy);
    
            gameDriver.handleEvent(0, new MockResponseMessage(1));
        });

        it('should merge events', () => {
            // const handlerProxy = mockHandlerProxy();
            // const gameDriver = buildMockGameDriver(handlerProxy);
    
            // gameDriver.handleEvent(0, new MockResponseMessage(1));
        });
    });
    it('#start', () => {});
    it('#resume', () => {});
    it('#isWaitingOnPlayer', () => {});
});
