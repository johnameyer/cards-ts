export function flatten<T>(reduction: T[], arr: T[]) {
    reduction.push(...arr);
    return reduction;
}
