import { DataResponseMessage, PlayCardResponseMessage } from "@cards-ts/core";
import { OrderUpResponseMessage, NameTrumpResponseMessage, DealerDiscardResponseMessage, GoingAloneResponseMessage } from "./response";

export type ResponseMessage = PlayCardResponseMessage
    | DataResponseMessage
    | OrderUpResponseMessage
    | NameTrumpResponseMessage
    | DealerDiscardResponseMessage
    | GoingAloneResponseMessage
;