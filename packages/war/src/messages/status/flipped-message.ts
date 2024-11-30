import { buildUnvalidatedMessage, Card, props } from '@cards-ts/core';

/**
 * Class that denotes that a card has been flipped
 */
export const FlippedMessage = buildUnvalidatedMessage(
    'flipped-message',
    props<{
        /** The player who flipped the card */
        player: string,
        /** The card that was flipped */
        card: Card,
    }>(),
    ({player, card}) => [ player, 'flipped', card ],
);