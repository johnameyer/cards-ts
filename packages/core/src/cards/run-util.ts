import { Meld } from './meld';
import { ThreeCardSet, checkThreeCardSet } from './three-card-set';
import { FourCardRun, checkFourCardRun } from './four-card-run';
import { Card } from './card';

/**
 * Function to check that a run is valid
 * @param t the run to check
 * @throws if not a valid run
 * @todo can this be reconsolidated into the runs directly
 */
export function checkRun(t: Meld): void {
    if(t.runType === 3) {
        checkThreeCardSet(t as ThreeCardSet);
    } else if(t.runType === 4) {
        checkFourCardRun(t as FourCardRun);
    }
}

/**
 * Rehydrates the run from an object
 * @param t the run to create from
 * @returns a valid ThreeCardSet or FourCardRun
 */
export function runFromObj(t: any): Meld {
    // TODO different from individual fromObj methods?
    if(t.runType === 3) {
        return new ThreeCardSet(t.cards.map(Card.fromObj));
    } else if(t.runType === 4) {
        return new FourCardRun(t.cards.map(Card.fromObj));
    } 
    throw new Error('Unknown run type');
    
}
