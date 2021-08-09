/**
 * Returns an array of increasing numbers
 * @param size the number of items
 * @param startAt the index to start at
 * @example range(5, 1)
 * > [1,2,3,4,5]
 */
export function range(size: number, startAt = 0): Array<number> {
    return [ ...Array(size).keys() ].map(i => i + startAt);
}

// Credit to https://stackoverflow.com/a/10050831/2088936
