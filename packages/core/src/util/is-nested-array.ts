/**
 * Type guard for testing if an array is an array of arrays
 * @param value the value to check
 */
export function isNestedArray<S extends [], T>(value: S | T[][]): value is T[][] {
    return value.every(Array.isArray);
}