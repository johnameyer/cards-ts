export function isNestedArray<S extends [], T>(value: S | T[][]): value is T[][] {
    return value.every(Array.isArray);
}