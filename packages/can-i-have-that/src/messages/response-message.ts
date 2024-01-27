import { WantCardResponseMessage, GoDownResponseMessage, PlayResponseMessage } from './response/index.js';
import { DiscardResponseMessage, DataResponseMessage } from '@cards-ts/core';

export type ResponseMessage = DiscardResponseMessage | GoDownResponseMessage | PlayResponseMessage | WantCardResponseMessage | DataResponseMessage;
