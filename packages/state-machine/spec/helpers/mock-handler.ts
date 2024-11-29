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

    private message: number;

    constructor(message: number) {
        this.message = message;
    }

    handleChoice(_: any, response: HandlerResponsesQueue<MockResponseMessage>): void {
        this.timesCalled += 1;
        // console.log(`Responding with ${this.message}`)
        response.push(new MockResponseMessage(this.message));
    }

    handleMessage(): void {}

    handleWaitingFor(): void {}

    setResponse(message: number): void {
        this.message = message;
    }
}
