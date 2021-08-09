import { Message } from '@cards-ts/core';

/**
 * Designates that a player is going alone
 */
export class GoingAloneResponseMessage extends Message {
    readonly type = 'going-alone-response';

    constructor(public readonly data?: any) {
        super([ 'Is going alone' ]);
    }
}
// TODO refactor logic into the bid and trump choice to allow for validation
