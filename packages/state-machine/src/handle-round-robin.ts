import { conditionalState } from './conditional-state.js';
import { handleSingle } from './handle-single.js';
import { loop } from './loop.js';
import { Named, NamedMachineLike } from './sequence.js';
import { Provider, Transition, NestedMachine } from './util.js';
import { IndexedControllers, GenericHandlerController, SystemHandlerParams, TurnController } from '@cards-ts/core';

// TODO how do we handle state better?
type HandleRoundRobinConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    startingPosition: Provider<T, number>,
    controller: Provider<T, TurnController>,
    /*
    * breakingAfter?
    * beforeAll?: Transition<T>,
    */
    /*
    * TODO ponder about semantics between outer *Each and inner (loop) *All
    * TODO ponder about semantics between loop *Each and inner *All / sequence
    */
    afterEach?: Transition<T>,
    // note that the before/After Each should be skipped 
    
    skipIf?: Provider<T, boolean>,
};

export function handleRoundRobin<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleRoundRobinConfig<T>): Named<NestedMachine<T>> {
    const id = (config.handler as any as string).toUpperCase();
    const skipIf = config.skipIf;
    
    let run: NamedMachineLike<T> = handleSingle({
        handler: config.handler,
        position: controllers => config.controller(controllers).get(),
        after: config.afterEach,
    });
    
    // ordering is important so that the afterEach is only applied if not skipped
    if(skipIf) {
        run = conditionalState({
            id: 'SKIP',
            condition: controllers => !skipIf(controllers),
            truthy: 'run' in run ? run.run : run,
        });
    }
    
    return loop({
        id,
        beforeAll: controllers => config.controller(controllers).set(config.startingPosition(controllers)),
        run: 'run' in run ? run.run : run,
        afterEach: controllers => config.controller(controllers).next(),
        // TODO fix like handleRoundRobinFirst
        breakingIf: controllers => config.startingPosition(controllers) === config.controller(controllers).get(),
    });
}
