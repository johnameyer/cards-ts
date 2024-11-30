import { buildEmptyMessage, Message } from './message.js';

/**
 * Empty message for adding spacing
 * @category Message
 * @class
 */
export const SpacingMessage = buildEmptyMessage(
    '',
    () => [],
);
