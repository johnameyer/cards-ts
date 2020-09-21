import { Message } from "../../games/message";
import { Card } from "../../cards/card";
import { Meld } from "../../cards/meld";
import { Serializable } from "../../intermediary/presenter";

function generateMessage(cards: Card[], run: Meld, player: string): Serializable[] {
    if(cards.length == run.cards.length) {
        return [player, 'played', run.toString()];
    }
    return [player, 'played', cards, 'on', run.toString()];
}

/**
 * A class designating that a player put down cards on the table
 */
export class PlayedMessage extends Message {
    /**
     * @param cards the cards that were played
     * @param run the run the cards were played on
     * @param player the player playing the cards
     */
    constructor(public readonly cards: Card[], public readonly run: Meld, public readonly player: string) {
        super(generateMessage(cards, run, player));
    }
}