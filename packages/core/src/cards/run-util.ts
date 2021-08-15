import { Meld } from './meld';
import { ThreeCardSet, checkThreeCardSet } from './three-card-set';
import { FourCardRun, checkFourCardRun } from './four-card-run';

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