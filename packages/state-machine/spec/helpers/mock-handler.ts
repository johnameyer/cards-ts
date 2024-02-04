import { Handler, HandlerResponsesQueue, SystemHandlerParams, Message } from '@cards-ts/core';

export type MockHandlerParams = {
    choice: [],
} & SystemHandlerParams;

export class MockResponseMessage extends Message {
    readonly type = 'mock-response';

    constructor(public value: number) {
        super([ value ]);
    }
}

export class MockHandler implements Handler<MockHandlerParams, undefined, MockResponseMessage> {
    public timesCalled: number = 0;

    private message?: MockResponseMessage = undefined;

    handleChoice(_: any, response: HandlerResponsesQueue<MockResponseMessage>): void {
        this.timesCalled += 1;
        if(!this.message) {
            throw new Error('Expected a response to be provided ahead of time');
        }
        response.push(this.message);
    }

    handleMessage(): void {}

    handleWaitingFor(): void {}

    setResponse(message: MockResponseMessage): void {
        this.message = message;
    }
}
