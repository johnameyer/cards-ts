import { Message } from "@cards-ts/core";

export class WantCardResponseMessage extends Message {
    public readonly type = 'want-card-response';

    constructor(public readonly wantCard: boolean, public readonly data?: any) {
        super(wantCard ? ['Wanted card'] : ['Did not want card']);
    }
}