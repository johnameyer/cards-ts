import { Handler, HandlerResponsesQueue } from '../src/index.js';
import { ChoiceMessage, Params } from './mock-handler-proxy.js';

export class MockHandler implements Handler<Params, undefined, ChoiceMessage> {
    private timesCalled: number = 0;

    private queue?: HandlerResponsesQueue<ChoiceMessage> = undefined;

    handleChoice(_: undefined, response: HandlerResponsesQueue<ChoiceMessage>): void {
        this.timesCalled += 1;
        this.queue = response;
    }

    handleMessage(): void {}

    handleWaitingFor(): void {}

    push(message: ChoiceMessage): void {
        if(this.queue === undefined) {
            throw new Error('Have not had a message come in to set the queue');
        }
        this.queue.push(message);
    }

    get(): number {
        return this.timesCalled;
    }
}
