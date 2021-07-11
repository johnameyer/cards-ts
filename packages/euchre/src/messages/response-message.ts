import { DataResponseMessage, TurnResponseMessage, TrumpChoiceResponseMessage, BidResponseMessage, DealerDiscardResponseMessage, GoingAloneResponseMessage } from './response';

export type ResponseMessage = TurnResponseMessage
    | DataResponseMessage
    | BidResponseMessage
    | TrumpChoiceResponseMessage
    | DealerDiscardResponseMessage
    | GoingAloneResponseMessage
;