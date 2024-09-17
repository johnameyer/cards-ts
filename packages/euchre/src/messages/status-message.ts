import { EndRoundMessage, PlayedMessage, WonRoundMessage, NameTrumpMessage, OrderUpMessage, PassMessage, TrumpMessage, WonTrickMessage } from './status/index.js';
import { GoingAloneMessage } from './status/going-alone-message.js';
import { DealerMessage, DealtOutMessage, LeadsMessage, TurnUpMessage } from '@cards-ts/core';

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
