/**
 * Flattens an array
 * @param reduction 
 * @param arr 
 */
export function flatten<T>(reduction: T[], arr: T[]) {
    reduction.push(...arr);
    return reduction;
}