import { Named } from './machine.js';
import { MachineLike, NestedMachine, Provider } from './machine.js';
import { IndexedControllers, GenericHandlerController } from '@cards-ts/core';

/**
 * @inline
 */
type ConditionalStateConfig<T extends IndexedControllers & { players: GenericHandlerController<any, any> }> = {
    /** The primary name / suffix to derive other state names from */
    id: string,
    /** The check that is run to determine if the truthy or falsey states run */
    condition: Provider<T, boolean>,
    /** The machine to execute if the condition is true */
    truthy: MachineLike<T>,
    /** The machine to run if the condition is false */
    falsey?: MachineLike<T>,
};

/**
 * Generates a state machine that branches into two other state machines based on a runtime check
 * @typeParam T The controllers this machine will use
 * @returns The generated state machine
 */
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
