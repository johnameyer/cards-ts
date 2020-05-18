import { Run } from './run';
import { ThreeCardSet, checkThreeCardSet } from './three-card-set';
import { FourCardRun, checkFourCardRun } from './four-card-run';
import { Card } from './card';

/**
 * Function to check that a run is valid
 * @param t the run to check
 * @throws if not a valid run
 * @todo can this be reconsolidated into the runs directly
 */
export function checkRun(t: Run): void {
    if (t.type === 3) {
        checkThreeCardSet(t as ThreeCardSet);
    } else if (t.type === 4) {
        checkFourCardRun(t as FourCardRun);
    }
}

/**
 * Rehydrates the run from an object
 * @param t the run to create from
 * @returns a valid ThreeCardSet or FourCardRun
 */
export function runFromObj(t: any): Run {
    if (t.type === 3) {
        return new ThreeCardSet(t.cards.map(Card.fromObj));
    } else if (t.type === 4) {
        return new FourCardRun(t.cards.map(Card.fromObj));
    } else {
        throw new Error('Unknown run type');
    }
}
