import { Card } from './card';
import Run from './run';

export default abstract class Handler {
    public async wantCard(card: Card, hand: Card[], played: Run[], roun: number[], isTurn: boolean, last: boolean) {
        return false;
    }

    public async turn(hand: Card[], played: Run[], others: Run[][], roun: number[], last: boolean)
    : Promise<{ toDiscard: Card, toPlay: Run[], forOthers: Run[][] }> {
        return { toDiscard: hand[0], toPlay: played, forOthers: others };
    }

    public abstract dealCard(card: Card, extra?: Card, dealt?: boolean ): void;

    public async abstract name(): Promise<string>;

    public abstract message(bundle: any): void;
}
