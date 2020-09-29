import { Card, Message } from "@cards-ts/core";

export class TurnResponseMessage extends Message {
    readonly type = 'turn-response';

    constructor(public readonly card: Card, public readonly data?: any) {
        super(['Played', card]);
    }
}