import { expect } from 'chai';
import 'mocha';
import { Card } from '../../lib/cards/card';
import { Handler } from '../../lib/cards/handlers/handler';
import { DealMessage, Message } from '../../lib';

export class HandlerHelper extends Handler {
    public cards: Card[] = [];

    public messages: Message[] = [];

    public getName(): string {
        return '';
    }

    public message(message: Message): void {
        this.messages.push(message);
        if(message instanceof DealMessage) {
            this.cards.push(message.card);
            if(message.extra) {
                this.cards.push(message.extra);
            }
        }
    }

    public clear() {
        this.cards = [];
        this.messages = [];
    }
}
