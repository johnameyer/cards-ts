import { Card } from '@cards-ts/core';
import { Controllers } from '../controllers/controllers.js';
import { PickupMessage } from '../messages/status/pickup-message.js';

/**
 * Gives a card to the player and notifies them
 * @param player the player to give the card to
 * @param card the card to give
 * @param extra the accompanying extra card, if applicable
 * @param dealt whether or not the card was dealt to the player
 */

export function giveCard(controllers: Controllers, player: number, card: Card, extra?: Card, message = true) {
    controllers.hand.get(player).push(card);
    if (extra) {
        controllers.hand.get(player).push(extra);
    }
    if (message) {
        controllers.players.message(player, new PickupMessage(card, extra));
    }
}
