import { TurnResponseMessage, WantCardResponseMessage, DataResponseMessage } from "./response";

export type ResponseMessage = TurnResponseMessage | WantCardResponseMessage | DataResponseMessage;