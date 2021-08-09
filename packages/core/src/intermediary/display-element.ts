import { Presenter } from './presenter';

export type Await<T> = T extends PromiseLike<infer U> ? U : T;

export type DisplayElement<T extends keyof Presenter> = {
    type: T;
} & Parameters<Presenter[T]>[0];

export type DisplayElementReturnType<T extends keyof Presenter> = ReturnType<Presenter[T]>;

export type DisplayElementCallReturn<T extends keyof Presenter> = Await<ReturnType<DisplayElementReturnType<T>>>;
