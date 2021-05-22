import { SpacingMessage } from '@cards-ts/core';
import { DealOutMessage, EndRoundMessage, LeadsMessage, NoPassingMessage, PassedMessage, PassingMessage, PlayedMessage, ScoredMessage, ShotTheMoonMessage } from './status';

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