import { MockHandlerParams, MockResponseMessage } from './mock-handler.js';
import { GenericHandlerProxy, Handler, HandlerChain, Provider, Serializable } from '@cards-ts/core';

export function mockHandlerProxy(players: Handler<MockHandlerParams, Serializable, MockResponseMessage>[]) {
    const handlerChains = players.map(handler => new HandlerChain().append(handler));
    const handlerData = new Provider<(position: number) => any>();
    handlerData.set((_) => undefined);
    return new GenericHandlerProxy(handlerChains, handlerData);
}
