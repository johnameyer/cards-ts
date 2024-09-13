import { Handler, HandlerChain, Serializable } from '../../src/index.js';
import { GenericHandlerProxy } from '../../src/games/generic-handler-controller.js';
import { Provider } from '../../src/util/provider.js';
import { MockHandlerParams, MockResponseMessage } from '../handlers/mock-handler.js';

export function mockHandlerProxy(players: Handler<MockHandlerParams, Serializable, MockResponseMessage>[]) {
    const handlerChains = players.map(handler => new HandlerChain().append(handler));
    const handlerData = new Provider<(position: number) => any>();
    handlerData.set(_ => undefined);
    return new GenericHandlerProxy(handlerChains, handlerData);
}
