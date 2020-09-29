export function isNestedArray<S, T>(value: S | T[][]): value is T[][] {
    // @ts-ignore
    return value.every(Array.isArray);
}