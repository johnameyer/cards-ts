import { buildMessage, cloneCard, cloneObject, cloneString } from '@cards-ts/core';

/**
 * Class that denotes that a card has been flipped
 */
export const FlippedMessage = buildMessage(
    'flipped-message',
    cloneObject({ player: cloneString, card: cloneCard }),
    ({player, card}) => [ player, 'flipped', card ],
);