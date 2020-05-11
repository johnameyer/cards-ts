import { expect } from 'chai';
import 'mocha';
import { Card } from '../../lib/cards/card';
import { Handler } from '../../lib/cards/handlers/handler';
import { DealMessage } from '../../lib';

export class HandlerHelper extends Handler {
    public cards: Card[] = [];

    public messages: any[][] = [];

    public getName(): string {
        return '';
    }

    public message(bundle: any): void {
        this.messages.push(bundle);
        if(bundle instanceof DealMessage) {
            this.cards.push(bundle.card);
            if(bundle.extra) {
                this.cards.push(bundle.extra);
            }
        }
    }

    public clear() {
        this.cards = [];
        this.messages = [];
    }
}
