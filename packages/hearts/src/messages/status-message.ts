import { EndRoundMessage, NoPassingMessage, PassedMessage, PassingMessage, PlayedMessage, ScoredMessage, ShotTheMoonMessage } from './status/index.js';
import { DealtOutMessage, LeadsMessage } from '@cards-ts/core';

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
