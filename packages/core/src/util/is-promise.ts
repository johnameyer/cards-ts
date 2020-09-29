export function isPromise<S, T>(value: S | Promise<T>): value is Promise<T> {
    // @ts-ignore
    return value && typeof value === 'object' && typeof value.then === 'function';
}