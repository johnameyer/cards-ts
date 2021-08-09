import { Message } from '@cards-ts/core';

export class OutOfCardsMessage extends Message {
    constructor(public readonly name: string) {
        super([ name, 'is out of cards' ]);
    }
}
