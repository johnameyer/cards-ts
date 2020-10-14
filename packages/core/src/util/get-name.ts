/**
 * Returns a unique version of the requested name
 * @param desired the name that the player wants
 * @param taken the names that are taken
 * @example getName('Jack', ['Jack'])
 * > 'Jack #2'
 */
export function getName(desired: string, taken: string[]): string {
    let name = desired;
    if(!name) {
        name = 'Unnamed Player';
    }

    if(!taken.includes(name)) {
        return name;
    }

    for(let i = 2; ; i++) {
        if(!taken.includes(name + ' #' + i)) {
            return name + ' #' + i;
        }
    }
}