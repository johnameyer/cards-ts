import { Message } from "../../games/message";

/**
 * A class designating that the deck was reshuffled
 */
export class ReshuffleMessage extends Message {
    constructor() {
        super(['The deck was reshuffled']);
    }
}