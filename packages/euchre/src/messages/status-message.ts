import { DealOutMessage, EndRoundMessage, LeadsMessage, PlayedMessage, DealerMessage, WonRoundMessage, NameTrumpMessage, OrderUpMessage, PassMessage, TrumpMessage, TurnUpMessage, WonTrickMessage } from './status';
import { GoingAloneMessage } from './status/going-alone-message';

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
    | GoingAloneMessage
    ;