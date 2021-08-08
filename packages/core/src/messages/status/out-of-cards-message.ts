import { Message } from "../message";

export class OutOfCardsMessage extends Message {
    constructor(public readonly name: string) {
        super([name, 'is out of cards']);
    }
}