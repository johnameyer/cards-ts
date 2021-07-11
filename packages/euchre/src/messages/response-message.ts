import { DataResponseMessage, TurnResponseMessage, NameTrumpResponseMessage, OrderUpResponseMessage, DealerDiscardResponseMessage, GoingAloneResponseMessage } from './response';

export type ResponseMessage = TurnResponseMessage
    | DataResponseMessage
    | OrderUpResponseMessage
    | NameTrumpResponseMessage
    | DealerDiscardResponseMessage
    | GoingAloneResponseMessage
;