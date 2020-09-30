import { Card, Meld, Message } from "@cards-ts/core";

export class TurnResponseMessage extends Message {
    public readonly type = 'turn-card-response';

    //Promise<{ toDiscard: Card | null, toPlay: Meld[][], data?: unknown } | null>
    constructor(public readonly toDiscard: Card | null, public readonly toPlay: Meld[][], public readonly data?: any) {
        super(wantCard ? ['Wanted card'] : ['Did not want card']);
    }
}