import { Message } from "@cards-ts/core";

export class FlipResponseMessage extends Message {
    readonly type = 'flip-response';

    constructor(public readonly data?: any) {
        super(['Flipped a card']);
    }
}