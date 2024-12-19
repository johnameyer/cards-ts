import { PassResponseMessage } from './response/index.js';
import { PlayCardResponseMessage } from '@cards-ts/core';

export type ResponseMessage = PassResponseMessage | PlayCardResponseMessage;
