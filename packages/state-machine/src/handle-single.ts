import { Machine, Provider } from './util.js';
import { IndexedControllers, GenericHandlerController, SystemHandlerParams } from '@cards-ts/core';

type HandleSingleConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    handler: T['players'] extends GenericHandlerController<any, infer Handles> ? Exclude<keyof Handles, keyof SystemHandlerParams> : never,
    position: Provider<T, number>,
};

export function handleSingle<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: HandleSingleConfig<T>): Machine<T> {
    const id = (config.handler as any as string).toUpperCase();
    const before = 'BEFORE_' + id;
    const after = 'AFTER_' + id;
    return {
        start: before,
        states: {
            [before]: {
                run: () => {},
                defaultTransition: id,
            },
            [id]: {
                run: controllers => controllers.players.handlerCall(config.position(controllers), config.handler),
                defaultTransition: after,
            },
            [after]: {
                run: () => {},
            },
        },
    };
}
