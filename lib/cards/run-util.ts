import { Run } from './run';
import { ThreeCardSet, checkThreeCardSet } from './three-card-set';
import { FourCardRun, checkFourCardRun } from './four-card-run';
import { Card } from '..';

export function checkRun(t: Run): void {
    if (t instanceof ThreeCardSet) {
        checkThreeCardSet(t);
    } else if (t instanceof FourCardRun) {
        checkFourCardRun(t);
    }
}

export function runFromObj(t: any): Run {
    if (t.type === 3) {
        return new ThreeCardSet(t.cards.map(Card.fromObj));
    } else if (t.type === 4) {
        return new FourCardRun(t.cards.map(Card.fromObj));
    } else {
        throw new Error('Unknown run type');
    }
}
