import { named, Named, NamedMachineLike, sequence } from './sequence.js';
import { Machine, MachineLike, Provider, Transition } from './util.js';
import { IndexedControllers, GenericHandlerController, SystemHandlerParams, isDefined } from '@cards-ts/core';

type HandleSingleConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    position: Provider<T, number>,
    before?: MachineLike<T>,
    after?: MachineLike<T>,
};

export function handleSingle<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleSingleConfig<T>): NamedMachineLike<T> {
    const id = (config.handler as any as string).toUpperCase();

    const mainNode = named(
        id,
        (controllers: T) => controllers.players.handlerCall(config.position(controllers), config.handler)
    ) as Named<{ run: Transition<T> }>;

    if(!config.before && !config.after) {
        return mainNode;
    }

    const asSequence = sequence([
        config.before ? named(`BEFORE_${id}`, config.before) : undefined,
        mainNode,
        config.after ? named(`AFTER_${id}`, config.after) : undefined,
    ].filter(isDefined)) as Machine<T>;

    return {
        name: id,
        ...asSequence,
    };
}
