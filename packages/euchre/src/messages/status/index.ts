import { DealtOutMessage, DealerMessage, EndRoundMessage, LeadsMessage, TurnUpMessage } from '@cards-ts/core';
import { GoingAloneMessage } from './going-alone-message.js';
import { NameTrumpMessage } from './name-trump-message.js';
import { OrderUpMessage } from './order-up-message.js';
import { PassMessage } from './pass-message.js';
import { TrumpMessage } from './trump-message.js';
import { WonRoundMessage } from './won-round-message.js';
import { WonTrickMessage } from './won-trick-message.js';
import { PlayedMessage } from './played-message.js';

export { DealtOutMessage, DealerMessage, EndRoundMessage, LeadsMessage, PlayedMessage, WonRoundMessage, PassMessage, OrderUpMessage, NameTrumpMessage, TrumpMessage, TurnUpMessage, WonTrickMessage, GoingAloneMessage };

export type StatusMessage = InstanceType<
    typeof DealtOutMessage
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
>