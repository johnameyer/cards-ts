import { Message, Presentable } from '@cards-ts/core';

function generateMessage(leader: string): Presentable[] {
    return [ leader, 'passed' ];
}

/**
 * Class that denotes to a handler that a player has passed
 */
export class PassMessage extends Message {

    public readonly type = 'pass-message';

    /**
     * @param player the hand that is passing
     */
    constructor(public readonly player: string) {
        super(generateMessage(player));
    }
}
