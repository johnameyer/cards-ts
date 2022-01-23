import { DealOutMessage, EndRoundMessage, PlayedMessage, WonRoundMessage, NameTrumpMessage, OrderUpMessage, PassMessage, TrumpMessage, WonTrickMessage } from './status';
import { GoingAloneMessage } from './status/going-alone-message';
import { DealerMessage, LeadsMessage, TurnUpMessage } from '@cards-ts/core';

export type StatusMessage =
    DealOutMessage
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
