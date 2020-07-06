export function distinct<T extends {equals: (t: T) => boolean}>(value: T, index: number, arr: T[]) {
    return arr.findIndex(other => value.equals(other)) === index;
}
