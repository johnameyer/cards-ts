/**
 * Class used to lazily provide a value
 */
export class Provider<T> {
    constructor(private provider?: () => T) { }

    set(t: T): void {
        this.provider = () => t;
    }
    
    get(): T {
        if(!this.provider) {
            throw new Error('Value was never provided');
        }
        return this.provider();
    }
}
