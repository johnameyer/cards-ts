import { handleSingle } from './handle-single.js';
import { Named } from './machine.js';
import { Provider, NestedMachine, MachineLike, Transition } from './machine.js';
import { IndexedControllers, GenericHandlerController, SystemHandlerParams, TurnController } from '@cards-ts/core';

/**
 * @inline
 */
type HandleRoundRobinFirstConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    /** The key of the game handler to call */
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    /** A provider of the position to begin calling first */
    startingPosition: Provider<T, number>,
    /** The controller to store the calling position state in */
    controller: Provider<T, TurnController>,
    /** A provider to identify if the user responded affirmatively / we should stop prompting other users */
    hasResponded: Provider<T, boolean>, // TODO merge into response type somehow?
    /** Logic that can be run before any handlers are called */
    beforeAll?: Transition<T>,
    /** Logic to be run after a player responds affirmatively */
    afterResponse?: MachineLike<T>,
    /** Logic to be run after a player passes */
    afterPass?: Transition<T>,
    /** Logic to be run at the end if no player responds */
    afterNone?: MachineLike<T>,
};

/**
 * Creates a machine that calls each player in turn looking for a certain response (e.g. whether they would like a card or not)
 * @typeParam T The controllers this machine will use
 * @returns The machine
 */
export function handleRoundRobinFirst<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleRoundRobinFirstConfig<T>): Named<NestedMachine<T>> {
    const id = (config.handler as any as string).toUpperCase();

    // TODO shorten if we only need one of either
    const beforeAll = 'BEFORE_ALL_' + id;
    // const beforeEach = 'BEFORE_EACH_' + id;
    const afterEach = 'AFTER_EACH_' + id;
    const afterResponse = 'AFTER_RESPONSE_' + id;
    const afterNone = 'AFTER_NONE_' + id;
    const afterPass = 'AFTER_PASS_' + id;

    const run = handleSingle({
        handler: config.handler,
        position: controllers => config.controller(controllers).get(),
    });

    return {
        name: id,
        start: beforeAll,
        states: {
            // TODO only include transitory states if needed to avoid need for `simplify`
            [beforeAll]: {
                run: controllers => {
                    if(config.beforeAll) {
                        config.beforeAll(controllers);
                    }
                    config.controller(controllers).set(config.startingPosition(controllers));
                },
                defaultTransition: id,
            },
            // [beforeEach]: {
            //     run: undefined,
            //     defaultTransition: id,
            // },
            [id]: {
                run,
                defaultTransition: afterEach,
            },
            [afterEach]: {
                /*
                TODO do we always need an after? Should we allow states to be terminal and have conditional transitions?
                TODO how do we prevent evaluating the transition before the response from the handler has been formally evaluated? sideEffect: true?
                TODO or otherwise, how can we prevent re-evaluation of the same state / calling of the same handler multiple times?
                Note that bugs only arise if the machine creates a node that calls a handler and also transitions back to itself.
                This can be caused by not having a `run` and the simplify logic not looking for this sort of loop (multiple nodes can be merged to cause this).
                Should the handler call xyz exist outside of the state machine somehow?
                This needs to be a step beyond the waiting mechanism as that simply prevents the state from advancing.
                One option: handler called by machine -> set flag to defer transition evaluation -> handler response -> evalate transition -> proceed
                Likely we need to wait until we phase out the old transition builder model.
                */
                run: () => {},
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
                defaultTransition: id,
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
