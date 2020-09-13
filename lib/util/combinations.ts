export function combinations<T>(arr: T[]) {
    var inner = function(current: readonly T[], future: readonly T[], results: T[][]) {
        if(future.length === 0) {
            results.push([...current]);
            return results;
        } else {
            inner([...current, future[0]], future.slice(1), results);
            inner([...current], future.slice(1), results);
        }
        return results;
    }
    return inner([], arr, []);
}