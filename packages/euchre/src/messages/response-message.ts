import { OrderUpResponseMessage, NameTrumpResponseMessage, DealerDiscardResponseMessage, GoingAloneResponseMessage } from './response/index.js';
import { DataResponseMessage, PlayCardResponseMessage } from '@cards-ts/core';

export type ResponseMessage = PlayCardResponseMessage
    | DataResponseMessage
    | OrderUpResponseMessage
    | NameTrumpResponseMessage
    | DealerDiscardResponseMessage
    | GoingAloneResponseMessage;
