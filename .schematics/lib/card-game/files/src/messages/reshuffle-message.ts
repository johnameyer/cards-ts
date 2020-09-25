import { Message } from "@cards-ts/core";

/*
    Basic class representing something happening
 */

/**
 * A class designating that the deck was reshuffled
 */
export class ReshuffleMessage extends Message {
    constructor() {
        super(['The deck was reshuffled']);
    }
}