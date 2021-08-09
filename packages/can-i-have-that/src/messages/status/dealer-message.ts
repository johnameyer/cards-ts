import { Message } from '@cards-ts/core';

export class DealerMessage extends Message {
    constructor(public readonly name: string) {
        super([ name, 'is dealer' ]);
    }
}
