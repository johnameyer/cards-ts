import { IndexedControllers } from '@cards-ts/core';
import { Machine, MachineLike, NestedMachine, Transition } from './util.js';

// function describer(i: number) {
//     return [
//         'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
//     ][i].toUpperCase();
// }

export type Named<T> = T & {
    name: string;
}


export type NamedMachineLike<T extends IndexedControllers> = Named<NestedMachine<T> | {run: Transition<T>}>;

export function named<T extends IndexedControllers>(name: string, machine: MachineLike<T>): NamedMachineLike<T> {
    if('start' in machine) {
        return {
            name,
            ...machine,
        }
    } else {
        return {
            name,
            run: machine,
        };
    }
}

/*
 * TODO fix inference of T - maybe use vararg definition?
 * TODO force naming? (or would we encourage before all / each usages?)
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
