import { Message } from "./message";

/**
 * Empty message for adding spacing
 */
export class SpacingMessage extends Message {
    public readonly type = '';

    constructor() {
        super([]);
    }
}