import { IndexedControllers } from "@cards-ts/core";
import { MachineLike, NamedMachineLike } from "./machine.js";


export function named<T extends IndexedControllers>(name: string, machine: MachineLike<T>): NamedMachineLike<T> {
    if ('start' in machine) {
        return {
            name,
            ...machine,
        };
    } else {
        return {
            name,
            run: machine,
        };
    }
}
