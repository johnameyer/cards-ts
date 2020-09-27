import { Card, Message } from "@cards-ts/core";

export class PassResponseMessage extends Message {
    readonly type = 'pass-response';

    constructor(public readonly cards: Card[], public readonly data: any) {
        super(['Passed', cards]);
    }
}