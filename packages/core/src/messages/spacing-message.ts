import { Message } from './message';

/**
 * Empty message for adding spacing
 * @category Message
 */
export class SpacingMessage extends Message {
    public readonly type = '';

    constructor() {
        super([]);
    }
}
