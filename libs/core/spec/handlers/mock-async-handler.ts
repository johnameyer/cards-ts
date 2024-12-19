import { Handler, HandlerResponsesQueue } from '../../src/index.js';
import { MockHandlerParams, MockResponseMessage } from './mock-handler.js';
import { Subject } from './subject.js';

export class MockAsyncHandler implements Handler<MockHandlerParams, undefined, MockResponseMessage> {
    public timesCalled: number = 0;

    public subject: Subject<() => Promise<MockResponseMessage>> = new Subject();

    async handleChoice(_: any, queue: HandlerResponsesQueue<MockResponseMessage>): Promise<void> {
        this.timesCalled += 1;

        const response = await this.subject.get();
        queue.push(response());

        this.subject = new Subject();
    }

    handleMessage(): void {}

    handleWaitingFor(): void {}

    respond(listener: Promise<MockResponseMessage>) {
        this.subject.resolve(() => listener);
    }
}
