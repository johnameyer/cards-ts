import { DealOutMessage, EndRoundMessage, NoPassingMessage, PassedMessage, PassingMessage, PlayedMessage, ScoredMessage, ShotTheMoonMessage } from './status';
import { LeadsMessage } from '@cards-ts/core';

export type StatusMessage =
    DealOutMessage
    | EndRoundMessage
    | LeadsMessage
    | NoPassingMessage
    | PassedMessage
    | PassingMessage
    | PlayedMessage
    | ScoredMessage
    | ShotTheMoonMessage;
