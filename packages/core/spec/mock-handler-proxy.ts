import { Handler, HandlerChain, Message, Serializable, SystemHandlerParams } from '../src/index.js';
import { GenericHandlerProxy } from '../src/games/generic-handler-controller.js';
import { Provider } from '../src/util/provider.js';

export type Params = {
    choice: [],
} & SystemHandlerParams;

export class ChoiceMessage extends Message {
    constructor(value: number) {
        super([ value ]);
    }
}

export function mockHandlerProxy(players: Handler<Params, Serializable, ChoiceMessage>[]) {
    const handlerChains = players.map(handler => new HandlerChain().append(handler));
    const handlerData = new Provider<(position: number) => any>();
    handlerData.set((_) => undefined);
    return new GenericHandlerProxy(handlerChains, handlerData);
}
