import { AbstractGameState } from "./abstract-game-state";
import { AbstractHandler } from "./abstract-handler";
import { Message } from "./message";

export abstract class AbstractHand<GameParams, State, HandlerData, Handler extends AbstractHandler<HandlerData>, GameState extends AbstractGameState<GameParams, State, HandlerData>> {
    /**
     * Create the hand
     * @param handler the handler to wrap around
     * @param position the position of this player at the table
     */
    constructor(protected readonly handler: Handler, public position: number) {
    }

    public getName(taken: string[]): string {
        let name = this.handler.getName(taken);
        if(!name) {
            name = 'Unnamed Player';
        }

        if(!taken.includes(name)) {
            return name;
        }

        for(let i = 2; ; i++) {
            if(!taken.includes(name + ' #' + i)) {
                return name + ' #' + i;
            }
        }
    }

    
    /**
     * Pass a message on to the handler
     * @param message the message
     */
    public async message(message: Message, game: GameState) {
        try {
            this.handler.message(message, game.transformToHandlerData(this.position));
        } catch (e) {
            // tslint:disable-next-line
            console.error(e);
        }
    }

    /**
     * Pass a waiting notification on to the handler
     * @param bundle the message
     */
    public async waiting(who: string[] | undefined, game: GameState) {
        try {
            this.handler.waitingFor(who, game.transformToHandlerData(this.position));
        } catch (e) {
            // tslint:disable-next-line
            console.error(e);
        }
    }
}