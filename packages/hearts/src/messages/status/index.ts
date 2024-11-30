import { DealtOutMessage, EndRoundMessage, LeadsMessage } from '@cards-ts/core';
import { NoPassingMessage } from './no-passing-message.js';
import { PassedMessage } from './passed-message.js';
import { PassingMessage } from './passing-message.js';
import { ScoredMessage } from './scored-message.js';
import { ShotTheMoonMessage } from './shot-the-moon-message.js';
import { PlayedMessage } from './played-message.js';

export { DealtOutMessage, EndRoundMessage, LeadsMessage, NoPassingMessage, PassedMessage, PassingMessage, PlayedMessage, ScoredMessage, ShotTheMoonMessage };

// TODO how to avoid this shenanigan
export type StatusMessage = InstanceType<
    typeof DealtOutMessage
    | typeof EndRoundMessage
    | typeof LeadsMessage
    | typeof NoPassingMessage
    | typeof PassedMessage
    | typeof PassingMessage
    | typeof PlayedMessage
    | typeof ScoredMessage
    | typeof ShotTheMoonMessage
    >;
