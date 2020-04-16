import { Card } from "../card";
import { Run } from "../run";
import { Message } from "../messages/message";

export abstract class Handler {
    public async wantCard(card: Card, hand: Card[], played: Run[][], position: number, roun: (3 | 4)[], isTurn: boolean, last: boolean) {
        return false;
    }

    public async turn(hand: Card[], others: Run[][], position: number, roun: (3 | 4)[], last: boolean)
    : Promise<{ toDiscard: Card | null, toPlay: Run[][] } | null> {
        return { toDiscard: hand[0], toPlay: others };
    }

    public abstract getName(): string;

    public abstract message(bundle: Message): void;
}
