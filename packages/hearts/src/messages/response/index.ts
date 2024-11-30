import { PlayCardResponseMessage } from '@cards-ts/core';
import { PassResponseMessage } from './pass-response-message.js';
import { TurnResponseMessage } from './turn-response-message.js';

export { PassResponseMessage, PlayCardResponseMessage, TurnResponseMessage };

export type ResponseMessage = InstanceType<typeof PassResponseMessage | typeof PlayCardResponseMessage | typeof TurnResponseMessage>;