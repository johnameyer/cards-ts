import { conditionalState } from './conditional-state.js';
import { handleSingle } from './handle-single.js';
import { loop } from './loop.js';
import { Named, NamedMachineLike } from './machine.js';
import { Provider, Transition, NestedMachine } from './machine.js';
import { IndexedControllers, GenericHandlerController, SystemHandlerParams, TurnController } from '@cards-ts/core';

// TODO how do we handle state better?
/**
 * @inline
 */
export type HandleRoundRobinConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    /** The key of the game handler to call */
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    /** A provider of the position to begin calling first */
    startingPosition: Provider<T, number>,
    /** The controller to store the calling position state in */
    controller: Provider<T, TurnController>,
    /*
     * breakingAfter?
     * beforeAll?: Transition<T>,
     */
    /*
     * TODO ponder about semantics between outer *Each and inner (loop) *All
     * TODO ponder about semantics between loop *Each and inner *All / sequence
     */
    /** Logic to be run after each handler is called */
    afterEach?: Transition<T>,
    // note that the before/After Each should be skipped 
    /** Determine if a handler should be called or not */
    skipIf?: Provider<T, boolean>,
};

/**
 * Creates a machine that calls each player in order
 * @typeParam T The controllers this machine will use
 * @returns The machine
 */
export function handleRoundRobin<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleRoundRobinConfig<T>): Named<NestedMachine<T>> {
    const id = (config.handler as any as string).toUpperCase();
    const skipIf = config.skipIf;
    
    let run = handleSingle({
        handler: config.handler,
        position: controllers => config.controller(controllers).get(),
        after: config.afterEach,
    });
    
    // ordering is important so that the afterEach is only applied if not skipped
    if(skipIf) {
        run = conditionalState({
            id: 'SKIP',
            condition: controllers => !skipIf(controllers),
            truthy: run,
        });
    }
    
    return loop({
        id,
        beforeAll: controllers => config.controller(controllers).set(config.startingPosition(controllers)),
        run,
        afterEach: controllers => config.controller(controllers).next(),
        // TODO fix like handleRoundRobinFirst
        breakingIf: controllers => config.startingPosition(controllers) === config.controller(controllers).get(),
    });
}
