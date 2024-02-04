import { handleSingle } from './handle-single.js';
import { Provider, NestedMachine, MachineLike, Transition } from './util.js';
import { IndexedControllers, GenericHandlerController, SystemHandlerParams, TurnController } from '@cards-ts/core';

type HandleRoundRobinFirstConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    startingPosition: Provider<T, number>,
    controller: Provider<T, TurnController>,   
    hasResponded: Provider<T, boolean>, // TODO merge into response type somehow?
    afterResponse?: MachineLike<T>,
    afterPass?: Transition<T>,
    afterNone?: MachineLike<T>,
};

export function handleRoundRobinFirst<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleRoundRobinFirstConfig<T>): NestedMachine<T> {
    const id = (config.handler as any as string).toUpperCase();

    // TODO shorten if we only need one of either
    const beforeAll = 'BEFORE_ALL_' + id;
    const beforeEach = 'BEFORE_EACH_' + id;
    const afterEach = 'AFTER_EACH_' + id;
    const afterResponse = 'AFTER_RESPONSE_' + id;
    const afterNone = 'AFTER_NONE_' + id;
    const afterPass = 'AFTER_PASS_' + id;

    return {
        start: beforeAll,
        states: {
            // TODO only include transitory states if needed to avoid need for `simplify`
            [beforeAll]: {
                run: controllers => config.controller(controllers).set(config.startingPosition(controllers)),
                defaultTransition: beforeEach,
            },
            [beforeEach]: {
                run: undefined,
                defaultTransition: id,
            },
            [id]: {
                run: handleSingle({
                    handler: config.handler,
                    position: controllers => config.controller(controllers).get(),
                }),
                defaultTransition: afterEach,
            },
            [afterEach]: { // TODO do we always need an after? Should we allow states to be terminal and have conditional transitions?
                transitions: [
                    {
                        state: afterResponse,
                        condition: config.hasResponded,
                    },
                ],
                defaultTransition: afterPass,
            },
            [afterPass]: {
                run: controllers => {
                    if(config.afterPass) {
                        config.afterPass(controllers);
                    }
                    config.controller(controllers).next();
                },
                transitions: [{
                    state: afterNone,
                    condition: controllers => config.controller(controllers).get() === config.startingPosition(controllers),
                }],
                defaultTransition: beforeEach,
            },
            [afterResponse]: {
                run: config.afterResponse,
            },
            [afterNone]: {
                run: config.afterNone,
            },
        },
    };
}
