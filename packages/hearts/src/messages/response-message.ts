import { PassResponseMessage } from './response';
import { DataResponseMessage, PlayCardResponseMessage } from '@cards-ts/core';

export type ResponseMessage = PassResponseMessage | PlayCardResponseMessage | DataResponseMessage;
