import { Message } from '../messages/message.js';
import { HandlerResponsesQueue } from '../games/response-queue.js';
import { SystemHandler } from '../handlers/system-handler.js';
import { Intermediary } from './intermediary.js';
import { Serializable } from './serializable.js';

export class IntermediarySystemHandler<HandlerData extends Serializable, ResponseMessage extends Message> extends SystemHandler<HandlerData, ResponseMessage> {
    constructor(private intermediary: Intermediary) {
        super();
    }
    
    handleMessage = async (_handlerData: HandlerData, _: HandlerResponsesQueue<ResponseMessage>, message: Message) => {
        await this.intermediary.print(...message.components)[0];
    };

    handleWaitingFor = async (_handlerData: HandlerData, _: HandlerResponsesQueue<ResponseMessage>, _who: number[] | number | undefined): Promise<void> => {
        // No-op
    };
}
