import { Card, FourCardRun, Meld, Message, ThreeCardSet } from '@cards-ts/core';

export class TurnResponseMessage extends Message {
    public readonly type = 'turn-card-response';

    constructor(public readonly toDiscard: Card | null, public readonly toPlay: Meld[][]) {
        // @ts-expect-error
        super([ ...(toDiscard ? [ 'Discarded', toDiscard ] : []), ...(toPlay ? [ 'Played', toPlay as (ThreeCardSet | FourCardRun) ] : []) ]);
    }
}
