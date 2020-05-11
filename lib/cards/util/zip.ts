type Zip<T extends unknown[][]> = { [I in keyof T]: T[I] extends (infer U)[] ? U : never }[];
export function zip<T extends unknown[][]>(...args: T): Zip<T> {
    return <Zip<T>><unknown>(args[0].map((_, c) => args.map(row => row[c])));
}