import { Handler, HandlerAction, HandlerResponsesQueue } from "@cards-ts/core";
import { HandlerData } from "./handler-data";
import { DiscardResponseMessage, GoDownResponseMessage, PlayResponseMessage, WantCardResponseMessage } from "./messages/response";
import { ResponseMessage } from "./messages/response-message";

/**
 * Class that players interact with the game using
 */
export abstract class GameHandler implements Handler<'wantCard' | 'turn', HandlerData, ResponseMessage> {
    canHandle(key: any): key is ('wantCard' | 'turn') {
       return key === 'wantCard' || key == 'turn';
    }

    /**
     * Whether this player wants the card or not
     * @param card the card being considered
     * @param isTurn whether it will be the player's turn once they pick up a card
     * @param gameState the current state of the game, as visible to the handler
     * @returns whether or not the card is wanted, along with the mutated custom data to be saved
     */
    abstract wantCard: HandlerAction<HandlerData, WantCardResponseMessage>;

    /**
     * Allow the player to make their turn
     * @param gameState the current state of the game, as visible to the handler
     * @returns the card to discard and the state of the table after having played cards
     */
    abstract turn: HandlerAction<HandlerData, GoDownResponseMessage | PlayResponseMessage | DiscardResponseMessage>;
}
