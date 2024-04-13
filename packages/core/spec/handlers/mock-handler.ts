import { Handler, HandlerResponsesQueue, SystemHandlerParams, Message } from '../../src/index.js';

export type Params = {
    choice: [],
} & SystemHandlerParams;

export class MockResponseMessage extends Message {
    constructor(value: number) {
        super([ value ]);
    }
}

export class MockHandler implements Handler<Params, undefined, MockResponseMessage> {
    private timesCalled: number = 0;

    private queue?: HandlerResponsesQueue<MockResponseMessage> = undefined;

    handleChoice(_: undefined, response: HandlerResponsesQueue<MockResponseMessage>): void {
        this.timesCalled += 1;
        this.queue = response;
    }

    handleMessage(): void {}

    handleWaitingFor(): void {}

    push(message: MockResponseMessage): void {
        if(this.queue === undefined) {
            throw new Error('Have not had a message come in to set the queue');
        }
        this.queue.push(message);
    }

    get(): number {
        return this.timesCalled;
    }
}
