import { cloneArray, cloneCard } from '../cloners.js';
import { buildMessage } from '../message.js';

// TODO rename? Different classes for different sources or enum?
/**
 * Class that denotes to a handler that they have been dealt or drawn a card
 * @category Message
 */
export const DealtOutMessage = buildMessage(
    'dealtOut',
    cloneArray(cloneCard),
    cards =>  [ 'Received', cards ],
);
