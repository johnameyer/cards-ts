import { WantCardResponseMessage, GoDownResponseMessage, PlayResponseMessage } from './response';
import { DiscardResponseMessage, DataResponseMessage } from '@cards-ts/core';

export type ResponseMessage = DiscardResponseMessage | GoDownResponseMessage | PlayResponseMessage | WantCardResponseMessage | DataResponseMessage;
