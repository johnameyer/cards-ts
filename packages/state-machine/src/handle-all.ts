import { NestedMachine } from './util.js';
import { GenericHandlerController, IndexedControllers, SystemHandlerParams } from '@cards-ts/core';

// TODO how do we handle state better?
type HandleAllConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
};

export function handleAll<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleAllConfig<T>): NestedMachine<T> {
    const id = (config.handler as any as string).toUpperCase();
    /*
     * const before = 'BEFORE_' + id;
     * const after = 'AFTER_' + id;
     */
    return {
        start: id,
        states: {
            /*
             * [before]: {
             *     run: () => {},
             *     defaultTransition: id,
             * },
             */
            [id]: {
                run: controllers => controllers.players.handlerCallAll(config.handler),
                // defaultTransition: after,
            },
            /*
             * [after]: {
             *     run: () => {},
             * },
             */
        },
    };
}
