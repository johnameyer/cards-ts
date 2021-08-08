export class Provider<T> {
    constructor(private provider?: () => T) {

    }

    set(t: T) {
        this.provider = () => t;
    }
    
    get() {
        if(!this.provider) {
            throw new Error('Value was never provided');
        }
        return this.provider();
    }
}