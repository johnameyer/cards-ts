import { WantCardResponseMessage, DataResponseMessage, DiscardResponseMessage, GoDownResponseMessage, PlayResponseMessage } from './response';

export type ResponseMessage = DiscardResponseMessage | GoDownResponseMessage | PlayResponseMessage | WantCardResponseMessage | DataResponseMessage;