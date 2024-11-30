import { Card } from '../../cards/card.js';
import { cloneArray, cloneCard } from '../cloners.js';
import { buildValidatedMessage, props } from '../message.js';

// TODO rename? Different classes for different sources or enum?
/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 * @category Message
 * @class
 */
export const DealtOutMessage = buildValidatedMessage(
    'dealtOut',
    props<
        /** The cards this hand was dealt */
        Card[]
    >(),
    cloneArray(cloneCard),
    cards =>  [ 'Received', cards ],
);
