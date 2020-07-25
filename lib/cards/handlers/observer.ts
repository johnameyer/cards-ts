import { Message } from "../messages/message";
import { HandlerData } from "./handler-data";

export interface Observer {
    /**
     * Allows the player to be informed of changes in the game state
     * @param bundle the incoming message
     */
    message(bundle: Message, data: HandlerData): void;

    /**
     * Notifies the player that we are waiting for another player to make their move
     * @param who who we are waiting for, or undefined if no one currently
     */
    waitingFor(who: string | undefined): void;
}