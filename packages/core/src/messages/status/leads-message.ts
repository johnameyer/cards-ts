import { Presentable } from '../../intermediary/presentable.js';
import { Message } from '../message.js';

function generateMessage(leader: string): Presentable[] {
    return [ leader, 'leads next trick' ];
}

/**
 * Class that denotes to a handler that a certain player is leading this round
 * @category Message
 */
export class LeadsMessage extends Message {

    public readonly type = 'leads-message';

    /**
     * @param leader the hand that is leading
     */
    constructor(public readonly leader: string) {
        super(generateMessage(leader));
    }
}
