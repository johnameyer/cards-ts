export function range(size: number, startAt:number = 0): Array<number> {
    return [...Array(size).keys()].map(i => i + startAt);
}

// Credit to https://stackoverflow.com/a/10050831/2088936