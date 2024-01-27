import { ControllerHandlerState, DiscardResponseMessage, Handler, HandlerAction } from '@cards-ts/core';
import { Controllers } from './controllers/controllers.js';
import { GameHandlerParams } from './game-handler-params.js';
import { GoDownResponseMessage, PlayResponseMessage, WantCardResponseMessage } from './messages/response/index.js';
import { ResponseMessage } from './messages/response-message.js';

export type HandlerData = ControllerHandlerState<Controllers>;

/**
 * Class that players interact with the game using
 */
export abstract class GameHandler implements Handler<GameHandlerParams, HandlerData, ResponseMessage> {
    /**
     * Whether this player wants the card or not
     * @param card the card being considered
     * @param isTurn whether it will be the player's turn once they pick up a card
     * @param gameState the current state of the game, as visible to the handler
     * @returns whether or not the card is wanted, along with the mutated custom data to be saved
     */
    abstract handleWantCard: HandlerAction<HandlerData, WantCardResponseMessage>;

    /**
     * Allow the player to make their turn
     * @param gameState the current state of the game, as visible to the handler
     * @returns the card to discard and the state of the table after having played cards
     */
    abstract handleTurn: HandlerAction<HandlerData, GoDownResponseMessage | PlayResponseMessage | DiscardResponseMessage>;
}
