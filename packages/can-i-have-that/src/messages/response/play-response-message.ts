import { Card, FourCardRun, Meld, Message, ThreeCardSet } from '@cards-ts/core';

export class PlayResponseMessage extends Message {
    public readonly type = 'play-response';

    // TODO need whose run?
    constructor(public readonly playOn: Meld, public readonly toPlay: Card[], public readonly newMeld: Meld, public readonly data?: any) {
        // @ts-ignore
        super([ 'Played', toPlay, ' on ', playOn as (ThreeCardSet | FourCardRun) ]);
    }
}
