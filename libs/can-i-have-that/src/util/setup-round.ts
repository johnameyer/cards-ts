import { Controllers } from '../controllers/controllers.js';

/**
 * Sets up the state for a new round
 */

export function setupRound(controllers: Controllers) {
    controllers.hand.reset();
    controllers.melds.reset();
    controllers.deck.resetDeck();
}
