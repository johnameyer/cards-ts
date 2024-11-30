import { buildUnvalidatedMessage, Card, Presentable, props } from '@cards-ts/core';

/**
 * Class that denotes to a handler that they have been passed certain cards
 */
export const PassedMessage = buildUnvalidatedMessage(
    'passed',
    props<{
        /** The cards being passed */
        cards: Card[],
        /** The person who is passing the cards */
        from: string,
    }>(),
    ({cards, from}) => [ 'Received', cards, 'from', from ],
);