import { DiscardResponseMessage, DataResponseMessage } from '@cards-ts/core';
import { WantCardResponseMessage, GoDownResponseMessage, PlayResponseMessage } from './response';

export type ResponseMessage = DiscardResponseMessage | GoDownResponseMessage | PlayResponseMessage | WantCardResponseMessage | DataResponseMessage;
