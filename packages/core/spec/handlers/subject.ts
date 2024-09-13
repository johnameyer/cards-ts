export class Subject<T> {
    #resolve: (value: T) => void = () => {}; // immediately set on line 7

    #internal = new Promise<T>(resolve => {
        this.#resolve = resolve;
    });

    async get(): Promise<T> {
        return await this.#internal;
    }

    resolve(value: T): void {
        this.#resolve(value);
    }
}
