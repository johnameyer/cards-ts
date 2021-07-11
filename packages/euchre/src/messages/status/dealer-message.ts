import { Message } from "@cards-ts/core";

/**
 * Message that denotes that a player is the dealer
 */
export class DealerMessage extends Message {
    constructor(public readonly name: string) {
        super([name, 'is dealer']);
    }
}