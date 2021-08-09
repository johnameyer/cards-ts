import { FourCardRun, Meld, Message, ThreeCardSet } from '@cards-ts/core';

export class GoDownResponseMessage extends Message {
    public readonly type = 'go-down-response';

    constructor(public readonly toPlay: Meld[], public readonly data?: any) {
        // @ts-ignore
        super([ 'Played', toPlay as (ThreeCardSet | FourCardRun) ]);
    }
}
