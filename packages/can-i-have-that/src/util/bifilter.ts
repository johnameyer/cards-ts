
export const bifilter = function<T>(arr: Array<T>, filter: (item: T) => any): [T[], T[]] {
    if(!filter) {
        return [ arr, []];
    }
    return arr.reduce<[T[], T[]]>(([ match, nonMatch ], item: T) => {
        if(filter(item)) {
            match.push(item);
        } else {
            nonMatch.push(item);
        }
        return [ match, nonMatch ] as const;
    }, [[], []]);
};