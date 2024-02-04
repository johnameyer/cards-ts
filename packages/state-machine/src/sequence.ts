import { MachineLike, NestedMachine } from './util.js';

function describer(i: number) {
    return [
        'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
    ][i].toUpperCase();
}

/*
 * TODO fix inference of T - maybe use vararg definition?
 * TODO force naming? (or would we encourage before all / each usages?)
 */
export function sequence<T>(machines: MachineLike<T>[]): NestedMachine<T> {
    const buildState = (machine: MachineLike<T>, i: number) => {
        const state = {
            run: machine,
        };
        if((i + 1) in machines) {
            // @ts-ignore
            state.defaultTransition = describer(i + 1);
            // TODO support undefined defaultTransition
        }
        return state;
    };

    return {
        start: describer(0),
        states: Object.fromEntries(machines.map((machine, i) => [ describer(i), buildState(machine, i) ])),
    };
}
