import { Card } from '../../cards/card.js';
import { cloneCard } from '../cloners.js';
import { buildValidatedMessage, props } from '../message.js';

/**
 * Class that denotes to a handler that a card was flipped over
 * @category Message
 * @class
 */
export const TurnUpMessage = buildValidatedMessage(
    'turn-up',
    props<Card>(),
    cloneCard,
    card => [ card, 'was turned over' ],
);
