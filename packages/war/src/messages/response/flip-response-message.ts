import { Message } from '@cards-ts/core';

export class FlipResponseMessage extends Message {
    readonly type = 'flip-response';

    constructor() {
        super([ 'Flipped a card' ]);
    }
}
