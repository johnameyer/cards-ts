import { Card } from "../card";
import { Run } from "../run";
import { Message } from "../messages/message";
import { HandlerData, HandlerCustomData } from "./handler-data";

/**
 * Class that players interact with the game using
 */
export interface Handler {
    /**
     * Whether this player wants the card or not
     * @param card the card being considered
     * @param isTurn whether it will be the player's turn once they pick up a card
     * @param gameState the current state of the game, as visible to the handler
     * @returns whether or not the card is wanted, along with the mutated custom data to be saved
     */
    wantCard(card: Card, isTurn: boolean, gameState: HandlerData): Promise<[boolean, HandlerCustomData?]>;

    /**
     * Allow the player to make their turn
     * @param gameState the current state of the game, as visible to the handler
     * @returns the card to discard and the state of the table after having played cards
     */
    turn(gameState: HandlerData): Promise<{ toDiscard: Card | null, toPlay: Run[][], data?: HandlerCustomData } | null>;

    /**
     * The name the user is known by
     * @param taken the names that are already taken by other users
     */
    getName(taken?: string[]): string;

    /**
     * Allows the player to be informed of changes in the game state
     * @param bundle the incoming message
     */
    message(bundle: Message, data: HandlerData): void;
}
