import { Message } from "../messages/message";
import { HandlerResponsesQueue } from "../games/response-queue";
import { SystemHandler } from "../handlers/system-handler";
import { Intermediary } from "./intermediary";

export class IntermediarySystemHandler<HandlerData, ResponseMessage extends Message> extends SystemHandler<HandlerData, ResponseMessage> {
    constructor(private intermediary: Intermediary) {
        super();
    }
    
    handleMessage = async (_handlerData: HandlerData, _: HandlerResponsesQueue<ResponseMessage>, message: Message) => {
        await this.intermediary.print(...message.components)[0];
    }

    handleWaitingFor = async (_handlerData: HandlerData, _: HandlerResponsesQueue<ResponseMessage>, _who: string[] | undefined): Promise<void> => {
        // No-op
    }
}