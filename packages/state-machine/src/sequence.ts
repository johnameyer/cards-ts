import { IndexedControllers } from '@cards-ts/core';
import { NamedMachineLike, NestedMachine } from './machine.js';

// TODO fix inference of T - maybe use vararg definition?
/**
 * Combines multiple machines into a sequence that will be called one by one
 * @param machines The machines to chain together
 * @typeParam T The controllers this machine will use
 * @returns 
 */
export function sequence<T extends IndexedControllers>(machines: Array<NamedMachineLike<T>>): NestedMachine<T> {
    // TODO apply before / after for unnamed?
    const buildState = (machine: NamedMachineLike<T>, i: number) => {
        const state = {
            run: 'start' in machine ? machine : machine.run,
        };
        if((i + 1) in machines) {
            // @ts-ignore
            state.defaultTransition = machines[i + 1].name;
            // TODO support undefined defaultTransition
        }
        return state;
    };

    return {
        start: machines[0].name,
        states: Object.fromEntries(machines.map((machine, i) => [ machine.name, buildState(machine, i) ])),
    };
}
