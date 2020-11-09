/**
 * Function to be used with filter that checks that the current item is not equal to any previous item
 * @param value the current value
 * @param index the index of the current value
 * @param arr the array
 */
export function distinct<T extends {equals: (t: T) => boolean}>(value: T, index: number, arr: T[]) {
    return arr.findIndex(other => value.equals(other)) === index;
}
