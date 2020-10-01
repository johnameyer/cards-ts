import { isPromise } from "../util/is-promise";

export interface HandlerResponsesQueue<Item> {
    push(item: Item | Promise<Item>): void;
}

export class ResponseQueue<Item> {
    private asyncQueue: Promise<[number, Item]>[] = [];
    private syncQueue: [number, Item][] = [];
    private asyncQueuePromise: Promise<void> = new Promise(resolver => this.asyncQueueResolver = resolver);
    private asyncQueueResolver!: () => void;


    for(handler: number) {
        const { asyncQueue, syncQueue, asyncQueueResolver } = this;
        return {
            push(item: Item | Promise<Item>) {
                if(isPromise(item)) {
                    asyncQueue.push(item.then(item => [handler, item]));
                    asyncQueueResolver();
                } else {
                    syncQueue.push([handler, item]);
                }
            }
        } as HandlerResponsesQueue<Item>;
    }


    * [Symbol.iterator]() {
        let popped: undefined | [number, Item];
        while(popped = this.syncQueue.pop()) {
            yield popped;
        }
    }

    async *[Symbol.asyncIterator]() {
        while(this.asyncQueue.length > 0) {
            const [promise] = await Promise.race(this.asyncQueue.map(promise => promise.then(() => [promise])));
            this.asyncQueue.splice(this.asyncQueue.indexOf(promise), 1);
            yield await promise;
        }
        this.asyncQueuePromise = new Promise(resolver => this.asyncQueueResolver = resolver);
    }

    asyncResponsesAvailable() {
        if(this.asyncQueue.length > 0) {
            return;
        }
        return this.asyncQueuePromise;
    }
}