import { Message } from '../message';

export class DealerMessage extends Message {
    constructor(public readonly name: string) {
        super([ name, 'is dealer' ]);
    }
}
