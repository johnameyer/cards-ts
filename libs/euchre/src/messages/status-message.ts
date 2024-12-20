import { PlayedMessage, WonRoundMessage, NameTrumpMessage, OrderUpMessage, PassMessage, TrumpMessage, WonTrickMessage, GoingAloneMessage } from './status/index.js';
import { DealerMessage, DealtOutMessage, EndRoundMessage, LeadsMessage, TurnUpMessage } from '@cards-ts/core';

export type StatusMessage =
    DealtOutMessage
    | DealerMessage
    | EndRoundMessage
    | LeadsMessage
    | PlayedMessage
    | WonRoundMessage
    | PassMessage
    | OrderUpMessage
    | NameTrumpMessage
    | TrumpMessage
    | TurnUpMessage
    | WonTrickMessage
    | GoingAloneMessage;
