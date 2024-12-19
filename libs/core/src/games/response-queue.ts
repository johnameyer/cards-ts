import { Serializable } from '../intermediary/serializable.js';
import { Message } from '../messages/message.js';
import { isPromise } from '../util/is-promise.js';

export type HandlerCustomData = Record<string, Serializable>;

export type WithOrWithoutData<T> = T | [T, HandlerCustomData];

export interface HandlerResponsesQueue<Item extends Message> {
    push(item: Item): void;
    push(item: Promise<WithOrWithoutData<Item | undefined>>): void;
    push(item: undefined | Item, data: HandlerCustomData): void;

    map<PreMapped extends Item>(mapping: (item: PreMapped) => WithOrWithoutData<Item>): MessageQueue<PreMapped>;
}

// TODO deprecate
export interface MessageQueue<Item extends Message> {
    push(item: Item): void;
    push(item: Promise<undefined | Item>): void;
}

/**
 * A queue that handlers push messages to to return them to the driver. Seamlessly handles async items and sync items.
 */
export class ResponseQueue<Item extends Message> {
    private asyncQueue: Promise<[number, [undefined | Item, HandlerCustomData | undefined]]>[] = [];

    private syncQueue: [number, [Item | undefined, HandlerCustomData | undefined]][] = [];

    private asyncQueuePromise: Promise<void> = new Promise(resolver => this.asyncQueueResolver = resolver);

    private asyncQueueResolver!: () => void;

    for(handler: number): HandlerResponsesQueue<Item> {
        const { asyncQueue, syncQueue, asyncQueueResolver } = this;
        return {
            push(item, data?: HandlerCustomData | undefined) {
                if(isPromise(item)) {
                    asyncQueue.push(item.then(item => Array.isArray(item) ? [ handler, item ] : [ handler, [ item, undefined ]]));
                    asyncQueueResolver();
                } else {
                    syncQueue.push([ handler, [ item, data ]]);
                }
            },
            map<Mapped extends Message>(mapping: (item: Mapped) => WithOrWithoutData<Item>) {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const wrapped = this;
                return {
                    push: (item: Mapped | Promise<Mapped>) => {
                        if(isPromise(item)) {
                            const t = item.then(mapping);
                            wrapped.push(t);
                        } else {
                            const t = mapping(item);
                            if(Array.isArray(t)) {
                                wrapped.push(t[0], t[1]);
                            } else {
                                wrapped.push(t);
                            }
                        }
                    },
                } as MessageQueue<Mapped>;
            },
        };
    }


    * [Symbol.iterator]() {
        let popped: undefined | [number, [undefined | Item, HandlerCustomData | undefined]];
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
