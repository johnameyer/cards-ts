import { Card } from './card';

export abstract class Run {
    public cards: Card[] = [];

    public abstract add(card: Card): void;
    public abstract isLive(card: Card): boolean;
    public abstract liveCards(): Card[];
    public abstract clone(): Run;
    public abstract toString(): string;
    public type: number = 0;
}
