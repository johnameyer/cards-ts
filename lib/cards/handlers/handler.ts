import { Card } from "../card";
import { Run } from "../run";
import { Message } from "../messages/message";

/**
 * Class that players interact with the game using
 */
export interface Handler {
    /**
     * Whether this player wants the card or not
     * @param card the card being considered
     * @param hand the player's current hand
     * @param played all of the cards currently played on the table
     * @param position the player's position at the table
     * @param round the sets the player needs for the current round
     * @param isTurn whether it will be the player's turn once they pick up a card
     * @param last whether it is the last round or not (no discards upon going down)
     * @returns whether or not the card is wanted
     */
    wantCard(card: Card, hand: Card[], played: Run[][], position: number, round: (3 | 4)[], isTurn: boolean, last: boolean): Promise<boolean>;

    /**
     * Allow the player to make their turn
     * @param hand the player's current hand
     * @param others all of the cards currently played on the table
     * @param position the player's position at the table
     * @param roun the sets the player needs for the current round
     * @param last whether it is the last round or not (no discards upon going down)
     * @returns the card to discard and the state of the table after having played cards
     */
    turn(hand: Card[], others: Run[][], position: number, roun: (3 | 4)[], last: boolean): Promise<{ toDiscard: Card | null, toPlay: Run[][] } | null>;

    /**
     * The name the user is known by
     */
    getName(): string;

    /**
     * Allows the player to be informed of changes in the game state
     * @param bundle the incoming message
     */
    message(bundle: Message): void;
}
