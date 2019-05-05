import { Card } from './card';

export default abstract class Run {
    public abstract add(card: Card): void;
    public abstract isLive(card: Card): boolean;
    public abstract liveCards(): Card[];
    public abstract clone(): Run;
}
