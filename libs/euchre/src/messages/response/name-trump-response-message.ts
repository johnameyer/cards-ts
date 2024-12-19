import { Message, Suit } from '@cards-ts/core';

/**
 * Designates that a player has either selected the trump or passed
 */
export class NameTrumpResponseMessage extends Message {
    readonly type = 'name-trump-response';

    constructor(public readonly trump: Suit | undefined) {
        super(trump ? [ 'Picked', trump ] : [ 'Passed' ]);
    }
}
