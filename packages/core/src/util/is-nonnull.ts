/**
 * Type guard for making sure a value is not undefined or void
 * @param t the item
 */
export const isNonnull = <T>(t: T | null): t is T => t !== null;
