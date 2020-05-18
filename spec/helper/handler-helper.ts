import { expect } from 'chai';
import 'mocha';
import { Card } from '../../lib/cards/card';
import { Handler } from '../../lib/cards/handlers/handler';
import { DealMessage, Message, Run } from '../../lib';

export class HandlerHelper implements Handler {
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
    
    wantCard(card: Card, hand: Card[], played: Run[][], position: number, round: (3 | 4)[], isTurn: boolean, last: boolean): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    turn(hand: Card[], others: Run[][], position: number, roun: (3 | 4)[], last: boolean): Promise<{ toDiscard: Card; toPlay: Run[][]; }> {
        throw new Error("Method not implemented.");
    } 
}
