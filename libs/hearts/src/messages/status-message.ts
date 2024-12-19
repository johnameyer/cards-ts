import { NoPassingMessage, PassedMessage, PassingMessage, PlayedMessage, ScoredMessage, ShotTheMoonMessage } from './status/index.js';
import { DealtOutMessage, EndRoundMessage, LeadsMessage } from '@cards-ts/core';

export type StatusMessage =
    DealtOutMessage
    | EndRoundMessage
    | LeadsMessage
    | NoPassingMessage
    | PassedMessage
    | PassingMessage
    | PlayedMessage
    | ScoredMessage
    | ShotTheMoonMessage;
