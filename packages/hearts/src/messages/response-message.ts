import { PassResponseMessage } from './response/index.js';
import { DataResponseMessage, PlayCardResponseMessage } from '@cards-ts/core';

export type ResponseMessage = PassResponseMessage | PlayCardResponseMessage | DataResponseMessage;
