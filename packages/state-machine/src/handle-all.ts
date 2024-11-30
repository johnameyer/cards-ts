import { sequence } from './sequence.js';
import { named } from './named.js';
import { NamedMachineLike } from './machine.js';
import { MachineLike } from './machine.js';
import { GenericHandlerController, IndexedControllers, isDefined, SystemHandlerParams } from '@cards-ts/core';

// TODO how do we handle state better?
/**
 * @inline
 */
export type HandleAllConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    /** The key of the game handler to call */
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    /** An optional machine to run before calling the handlers */
    before?: MachineLike<T>,
    /** An optional machine to run after calling the handlers */
    after?: MachineLike<T>,
};

/**
 * Creates a machine that calls all handlers at the same time
 * @typeParam T The controllers this machine will use
 * @returns The machine
 */
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
