import { roundToString } from '../../util/round-to-string.js';
import { Message, Presentable } from '@cards-ts/core';

function generateMessage(round: readonly number[]): Presentable[] {
    return roundToString(round);
}

/**
 * A class designating that a new round has started
 */
export class StartRoundMessage extends Message {
    /**
     * @param round the new round
     */
    constructor(public readonly round: readonly number[]) {
        super(generateMessage(round));
    }
}
