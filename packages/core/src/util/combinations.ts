/**
 * Returns all possible combinations of the provided items
 * @param arr the items to use
 * @example combinations([1,2])
 * > [[], [1], [2], [1,2]]
 */
export const combinations = <T>(arr: T[]): T[][] => {
    const inner = function(current: readonly T[], future: readonly T[], results: T[][]) {
        if(future.length === 0) {
            results.push([ ...current ]);
            return results;
        } 
        inner([ ...current, future[0] ], future.slice(1), results);
        inner([ ...current ], future.slice(1), results);
        
        return results;
    };
    return inner([], arr, []);
};
