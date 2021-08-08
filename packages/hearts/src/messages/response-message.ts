import { DataResponseMessage, PlayCardResponseMessage } from "@cards-ts/core";
import { PassResponseMessage } from "./response";

export type ResponseMessage = PassResponseMessage | PlayCardResponseMessage | DataResponseMessage;