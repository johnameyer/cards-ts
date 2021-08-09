import { Message } from '@cards-ts/core';

export class DataResponseMessage extends Message {
    readonly type = 'data-response';

    constructor(public readonly data: any) {
        super([]);
    }
}
