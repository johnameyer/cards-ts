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