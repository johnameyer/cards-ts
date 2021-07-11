import { Card, Message } from "@cards-ts/core";

/**
 * Designates that a player has either selected the face up card as trump or passed
 */
export class OrderUpResponseMessage extends Message {
    readonly type = 'order-up-response';

    constructor(public readonly selectingTrump: boolean, public readonly data?: any) {
        super(selectingTrump ? ['Picked trump'] : ['Passed']);
    }
}