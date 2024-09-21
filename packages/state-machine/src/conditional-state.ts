import { Named } from './sequence.js';
import { MachineLike, NestedMachine, Provider } from './util.js';
import { IndexedControllers, GenericHandlerController } from '@cards-ts/core';

type ConditionalStateConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    id: string,
    condition: Provider<T, boolean>,
    truthy: MachineLike<T>,
    falsey?: MachineLike<T>,
};

export function conditionalState<T extends IndexedControllers & { players: GenericHandlerController<any, any> }>(config: ConditionalStateConfig<T>): Named<NestedMachine<T>> {
    const id = (config.id as any as string).toUpperCase();
    const check = 'CHECK_' + id;
    const truthy = 'IF_' + id;
    const falsey = 'IF_NOT_' + id;
    return {
        name: id,
        start: check,
        states: {
            [check]: {
                transitions: [{
                    condition: config.condition,
                    state: truthy,
                }],
                defaultTransition: falsey,
            },
            [truthy]: {
                run: config.truthy,
            },
            [falsey]: {
                run: config.falsey,
            },
        },
    };
}
