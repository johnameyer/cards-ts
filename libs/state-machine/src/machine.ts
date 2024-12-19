import { IndexedControllers } from '@cards-ts/core';

/**
 * @inline
 */
export type Transition<T> = (controllers: T) => void; // TODO rename - transition implies change of state

/**
 * @inline
 */
export type Provider<T, U> = (controllers: T) => U;

/**
 * @inline
 */
export type Condition<T> = Provider<T, boolean>;
export type TransitionOptions<T, K extends string> = {
    defaultTransition: K;
    transitions?: { condition: Condition<T>; state: K; }[];
};

export type StronglyTypedMachine<T, K extends string> = {
    start: K;
    states: {
        [state in K]: {
            run?: Transition<T>;
        } & (TransitionOptions<T, K> | {});
    };
};

export type Machine<T> = StronglyTypedMachine<T, string>;

export type MachineLike<T> = Transition<T> | NestedMachine<T>;

export type NestedMachine<T> = {
    start: string;
    states: {
        [state: string]: {
            run?: MachineLike<T>;
        } & (TransitionOptions<T, string> | {});
    };
};

export type Named<T> = T & {
    name: string;
};

export type NamedTransition<T extends IndexedControllers> = Named<{ run: Transition<T>; }>;

export type NamedMachineLike<T extends IndexedControllers> = Named<NestedMachine<T>> | NamedTransition<T>;
