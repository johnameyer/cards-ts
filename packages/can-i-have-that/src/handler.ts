import { GenericHandler, HandlerResponsesQueue } from "@cards-ts/core";
import { HandlerData } from "./handler-data";
import { DiscardResponseMessage, GoDownResponseMessage, PlayResponseMessage, WantCardResponseMessage } from "./messages/response";
import { ResponseMessage } from "./messages/response-message";

/**
 * Class that players interact with the game using
 */
export interface Handler extends GenericHandler<HandlerData, ResponseMessage> {
    /**
     * Whether this player wants the card or not
     * @param card the card being considered
     * @param isTurn whether it will be the player's turn once they pick up a card
     * @param gameState the current state of the game, as visible to the handler
     * @returns whether or not the card is wanted, along with the mutated custom data to be saved
     */
    wantCard(gameState: HandlerData, responseQueue: HandlerResponsesQueue<WantCardResponseMessage>): void | Promise<void>;

    /**
     * Allow the player to make their turn
     * @param gameState the current state of the game, as visible to the handler
     * @returns the card to discard and the state of the table after having played cards
     */
    turn(gameState: HandlerData, responseQueue: HandlerResponsesQueue<DiscardResponseMessage | GoDownResponseMessage | PlayResponseMessage>): void | Promise<void>;
}
