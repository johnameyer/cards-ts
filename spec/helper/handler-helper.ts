import { expect } from 'chai';
import 'mocha';
import { Card } from '../../lib/cards/card';
import Handler from '../../lib/cards/handler';

export default class HandlerHelper extends Handler {
    public cards: Card[] = [];

    public messages: any[][] = [];

    public dealCard(card: Card, extra?: Card, dealt?: boolean): void {
        this.cards.push(card);
        if (extra) {
            this.cards.push(extra);
        }
    }

    public async name(): Promise<string> {
        return 'X';
    }

    public message(bundle: any): void {
        this.messages.push(bundle);
    }

    public clear() {
        this.cards = [];
        this.messages = [];
    }
}
