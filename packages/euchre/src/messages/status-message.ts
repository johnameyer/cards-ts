import { PlayedMessage, WonRoundMessage, NameTrumpMessage, OrderUpMessage, PassMessage, TrumpMessage, WonTrickMessage, GoingAloneMessage } from './status/index.js';
import { DealerMessage, DealtOutMessage, EndRoundMessage, LeadsMessage, TurnUpMessage } from '@cards-ts/core';

type InstanceType<S> = S extends { new(...t: any[]): infer T} ? T : never;

type X = InstanceType<typeof DealerMessage>;

export type StatusMessage = InstanceType<
    typeof DealtOutMessage
    | typeof DealerMessage
    | typeof DealerMessage
    | typeof EndRoundMessage
    | typeof LeadsMessage
    | typeof PlayedMessage
    | typeof WonRoundMessage
    | typeof PassMessage
    | typeof OrderUpMessage
    | typeof NameTrumpMessage
    | typeof TrumpMessage
    | typeof TurnUpMessage
    | typeof WonTrickMessage
    | typeof GoingAloneMessage
>;
