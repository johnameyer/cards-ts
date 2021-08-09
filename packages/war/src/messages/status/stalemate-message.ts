import { Message, Presentable } from '@cards-ts/core';

function generateMessage(): Presentable[] {
    return [ 'Game went over the max number of battles' ];
}

/**
 * Class that denotes that a player won
 */
export class StalemateMessage extends Message {

    public readonly type = 'stalemate-message';

    constructor() {
        super(generateMessage());
    }
}
