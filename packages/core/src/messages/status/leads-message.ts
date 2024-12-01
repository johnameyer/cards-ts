import { cloneString } from '../cloners.js';
import { buildValidatedMessage, props } from '../message.js';

// TODO should we wrap all types in an object so the message can be passed on instead of needing this param workaround?
/**
 * Class that denotes to a handler that a certain player is leading this round
 * @category Message
 * @class
 * @param payload The hand that is leading
 */
export const LeadsMessage = buildValidatedMessage(
    'leads',
    props<string>(),
    cloneString,
    leader => [ leader, 'leads next trick' ],
);
