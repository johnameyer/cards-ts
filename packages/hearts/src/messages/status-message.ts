import { LeadsMessage } from '@cards-ts/core';
import { DealOutMessage, EndRoundMessage, NoPassingMessage, PassedMessage, PassingMessage, PlayedMessage, ScoredMessage, ShotTheMoonMessage } from './status';

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