import { DiscardResponseMessage } from "@cards-ts/core";
import { GoDownResponseMessage } from "./go-down-response-message.js";
import { PlayResponseMessage } from "./play-response-message.js";
import { WantCardResponseMessage } from "./want-card-response-message.js";

export { DiscardResponseMessage, GoDownResponseMessage, PlayResponseMessage, WantCardResponseMessage };

export type ResponseMessage = DiscardResponseMessage | GoDownResponseMessage | PlayResponseMessage | WantCardResponseMessage;