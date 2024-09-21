import { Card } from '@cards-ts/core';

export const followsTrick = (trick: ReadonlyArray<Card | undefined>, card: Card, hand: ReadonlyArray<Card>): boolean => trick[0]?.suit === undefined || card.suit === trick[0].suit || !hand.some(card => card.suit === trick[0]?.suit);
