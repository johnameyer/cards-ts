import { buildEmptyMessage } from '@cards-ts/core/lib/messages/message.js';

export const FlipResponseMessage = buildEmptyMessage(
    'flipResponse',
    () => [ 'Flipped a card' ],
)