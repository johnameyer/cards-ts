import { WantCardResponseMessage, GoDownResponseMessage, PlayResponseMessage } from './response/index.js';
import { DiscardResponseMessage } from '@cards-ts/core';

export type ResponseMessage = DiscardResponseMessage | GoDownResponseMessage | PlayResponseMessage | WantCardResponseMessage;
