import { PassResponseMessage, TurnResponseMessage } from "./response";
import { DataResponseMessage } from "./response/data-response-message";

export type ResponseMessage = PassResponseMessage | TurnResponseMessage | DataResponseMessage;