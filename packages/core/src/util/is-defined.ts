/**
 * Type guard for making sure a value is not undefined or void
 * @param t the item
 */
export const isDefined = <T>(t: T | undefined | void): t is T => t !== undefined;
