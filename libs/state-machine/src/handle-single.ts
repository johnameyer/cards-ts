import { sequence } from './sequence.js';
import { named } from './named.js';
import { Named, NamedMachineLike, NamedTransition, NestedMachine } from './machine.js';
import { Machine, MachineLike, Provider, Transition } from './machine.js';
import { IndexedControllers, GenericHandlerController, SystemHandlerParams, isDefined } from '@cards-ts/core';

/**
 * @inline
 */
type HandleSingleConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    /** The key of the game handler to call */
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    /** The position of the handler to call */
    position: Provider<T, number>,
    /** Logic to run before calling the handler */
    before?: MachineLike<T>,
    /** Logic to run after calling the handler */
    after?: MachineLike<T>,
};

// TODO should be split into just the transition v.s. the machine?
/**
 * Creates a machine (or transition) that calls a single player
 * @typeParam T The controllers this machine will use
 * @returns The machine
 */
export function handleSingle<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleSingleConfig<T>): Named<NestedMachine<T>> {
    const id = (config.handler as any as string).toUpperCase();

    const mainNode = named(
        id,
        (controllers: T) => controllers.players.handlerCall(config.position(controllers), config.handler)
    ) as Named<{ run: Transition<T> }>;

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
