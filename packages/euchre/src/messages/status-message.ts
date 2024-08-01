import { DealOutMessage, EndRoundMessage, PlayedMessage, WonRoundMessage, NameTrumpMessage, OrderUpMessage, PassMessage, TrumpMessage, WonTrickMessage } from './status/index.js';
import { GoingAloneMessage } from './status/going-alone-message.js';
import { DealerMessage, LeadsMessage, TurnUpMessage } from '@cards-ts/core';

type InstanceType<S> = S extends { new(...t: any[]): infer T} ? T : never;

type X = InstanceType<typeof DealerMessage>;

export type StatusMessage =
    DealOutMessage
    | InstanceType<typeof DealerMessage>
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
