import { WithData } from '../handlers/handler.js';
import { isPromise } from '../util/is-promise.js';

export interface HandlerResponsesQueue<Item> {
    push(item: undefined | Item | WithData<undefined | Item> | Promise<undefined | Item | WithData<undefined | Item>>): void;

    map<PreMapped>(mapping: (item: PreMapped) => Item | WithData<Item>): HandlerResponsesQueue<PreMapped>;
}

/**
 * A queue that handlers push messages to to return them to the driver. Seamlessly handles async items and sync items.
 */
export class ResponseQueue<Item> {
    private asyncQueue: Promise<[number, Item | WithData<Item> | undefined]>[] = [];

    private syncQueue: [number, Item | undefined][] = [];

    private asyncQueuePromise: Promise<void> = new Promise(resolver => this.asyncQueueResolver = resolver);

    private asyncQueueResolver!: () => void;

    for(handler: number) {
        const { asyncQueue, syncQueue, asyncQueueResolver } = this;
        return {
            push(item: undefined | Item | Promise<undefined | Item>) {
                if(isPromise(item)) {
                    asyncQueue.push(item.then(item => [ handler, item ]));
                    asyncQueueResolver();
                } else {
                    syncQueue.push([ handler, item ]);
                }
            },
            map<Mapped>(mapping: (item: Mapped) => Item) {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const wrapped = this;
                return {
                    push: (item: Mapped | Promise<Mapped>) => {
                        wrapped.push(isPromise(item) ? item.then(mapping) : mapping(item));
                    },
                    map: <InnerMapped>(innerMapping: (item: InnerMapped) => Mapped) => wrapped.map((innermost: InnerMapped) => mapping(innerMapping(innermost))),
                } as HandlerResponsesQueue<Mapped>;
            },
        } as HandlerResponsesQueue<Item>;
    }


    * [Symbol.iterator]() {
        let popped: undefined | [number, Item | WithData<Item> | undefined];
        // eslint-disable-next-line no-cond-assign
        while(popped = this.syncQueue.shift()) {
            yield popped;
        }
    }

    async * [Symbol.asyncIterator]() {
        while(this.asyncQueue.length > 0) {
            const [ promise ] = await Promise.race(this.asyncQueue.map(promise => promise.then(() => [ promise ])));
            this.asyncQueue.splice(this.asyncQueue.indexOf(promise), 1);
            yield await promise;
        }
        this.asyncQueuePromise = new Promise(resolver => this.asyncQueueResolver = resolver);
    }

    asyncResponsesQueued() {
        return this.asyncQueue.length > 0;
    }

    asyncResponsesAvailable() {
        if(this.asyncQueue.length > 0) {
            return;
        }
        return this.asyncQueuePromise;
    }
}
