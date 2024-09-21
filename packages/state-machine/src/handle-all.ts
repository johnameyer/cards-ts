import { named, Named, NamedMachineLike, sequence } from './sequence.js';
import { MachineLike, NestedMachine, Transition } from './util.js';
import { GenericHandlerController, IndexedControllers, isDefined, SystemHandlerParams } from '@cards-ts/core';

// TODO how do we handle state better?
type HandleAllConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    before?: MachineLike<T>,
    after?: MachineLike<T>,
};

export function handleAll<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleAllConfig<T>): NamedMachineLike<T> {
    const id = (config.handler as any as string).toUpperCase();

    return {
        name: id,
        ...sequence([
            config.before ? named(`BEFORE_${id}`, config.before) : undefined,
            named(
                id,
                (controllers: T) => controllers.players.handlerCallAll(config.handler)
            ),
            config.after ? named(`AFTER_${id}`, config.after) : undefined,
        ].filter(isDefined)),
    };
}
