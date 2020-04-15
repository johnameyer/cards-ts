import { Message } from "./message";

export class ReshuffleMessage extends Message {
    constructor() {
        super('The deck was reshuffled');
    }
}