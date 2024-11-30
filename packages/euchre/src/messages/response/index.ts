import { PlayCardResponseMessage } from "@cards-ts/core";
import { DealerDiscardResponseMessage } from "./dealer-discard-response-message.js";
import { GoingAloneResponseMessage } from "./going-alone-response-message.js";
import { NameTrumpResponseMessage } from "./name-trump-response-message.js";
import { OrderUpResponseMessage } from "./order-up-response-message.js";

export { OrderUpResponseMessage, NameTrumpResponseMessage, DealerDiscardResponseMessage, GoingAloneResponseMessage, PlayCardResponseMessage };

export type ResponseMessage = PlayCardResponseMessage
    | OrderUpResponseMessage
    | NameTrumpResponseMessage
    | DealerDiscardResponseMessage
    | GoingAloneResponseMessage;