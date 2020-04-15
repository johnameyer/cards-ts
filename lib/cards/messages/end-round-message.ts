import { Message } from "./message";
import { Hand } from "../hand";

export class EndRoundMessage extends Message {
    constructor(public readonly players: readonly string[], public readonly scores: readonly number[]) {
        super(players.join('\t') + '\n' + scores.join('\t'));
    }
}