/**
 * Type guard for whether a value is a promise (or promise-like)
 * @param value the value to test
 */
export function isPromise<S, T>(value: S | Promise<T>): value is Promise<T> {
    return value && typeof value === 'object' && typeof (value as any).then === 'function';
}