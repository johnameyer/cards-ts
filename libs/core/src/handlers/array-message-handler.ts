import { Message } from '../messages/message.js';
import { MessageHandler } from './message-handler.js';

/**
 * @category Handler
 */
export class ArrayMessageHandler<StatusMessage extends Message> extends MessageHandler<{}, Message> {
    public arr: Array<StatusMessage> = [];

    public handleMessage = (_state: {}, _response: {}, msg: Message) => {
        // console.log(Message.defaultTransformer(msg.components));
        if(msg.type !== '') { // skip SpacingMessage
            this.arr.push(msg as StatusMessage);
        }
    };

    public clear() {
        this.arr = [];
    }
}
