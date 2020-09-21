import { expect } from 'chai';
import 'mocha';
import { Card } from '../../lib/cards/card';
import { DealMessage, Handler, Message, Run } from '../../lib';

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

    waitingFor() {
    }

    public clear() {
        this.cards = [];
        this.messages = [];
    }
    
    wantCard(card: Card, isTurn: boolean, gameState: any): Promise<[boolean]> {
        throw new Error("Method not implemented.");
    }

    turn(gameState: any): Promise<{ toDiscard: Card; toPlay: Run[][]; }> {
        throw new Error("Method not implemented.");
    } 
}
