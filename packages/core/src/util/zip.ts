type Zip<T extends unknown[][]> = { [I in keyof T]: T[I] extends (infer U)[] ? U : never }[];

/**
 * Util function allowing for iterating over multiple arrays item by item
 * @param args the arrays to iterate over
 * @returns an array with rows and columns flipped
 */
export function zip<T extends unknown[][]>(...args: T) {
    return (args[0].map((_, c) => args.map(row => row[c]))) as unknown as Zip<T>;
}