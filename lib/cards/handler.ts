import { Card } from "./card";
import { Run } from "./run";
import { Message } from "./messages/message";

export abstract class Handler {
    public async wantCard(card: Card, hand: Card[], played: Run[], roun: number[], isTurn: boolean, last: boolean) {
        return false;
    }

    public async turn(hand: Card[], others: Run[][], position: number, roun: number[], last: boolean)
    : Promise<{ toDiscard: Card, toPlay: Run[][] } | null> {
        return { toDiscard: hand[0], toPlay: others };
    }

    public abstract getName(): string;

    public abstract message(bundle: Message): void;
}
