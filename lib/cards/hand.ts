import { Card } from './card';
import { Run } from './run';
import { Handler } from './handlers/handler';
import { GameState } from './game-state';
import { checkRun } from './run-util';
import { Message } from './messages/message';
import { DealMessage } from './messages/deal-message';
import { zip } from './util/zip';
import { InvalidError } from './invalid-error';

const mapToClone = <T extends {clone: () => T}>(arr: T[]) => arr.map((t: T) => t.clone());

function checkExistenceAndRemove<T extends {equals: (t: T) => boolean}>(tarr: T[], t: T, errorMessage: string = 'Could not find card') {
    const tIndex = tarr.findIndex((ti) => t.equals(ti));
    if (tIndex === -1) {
        throw new Error(errorMessage + ' ' + t.toString() + ' in ' + tarr.toString());
    }
    tarr.splice(tIndex, 1);
}

/**
 * This class is a wrapper around handlers to verify that cards are correctly played and that players are not able to modify the state
 * It should be stateless
 */
export class Hand {

    /**
     * Create the hand
     * @param handler the handler to wrap around
     * @param position the position of this player at the table
     */
    constructor(private readonly handler: Handler, public position: number) {
    }

    /**
     * Allow the handler to decide if it wants a card, and prevent it from throwing an error up the call stack
     * @param card the card to be considered
     * @param game the state of the game
     * @param isTurn whether it will be the player's turn upon taking a card
     */
    public async wantCard(card: Card, game: GameState, isTurn: boolean = false): Promise<boolean> {
        const playedClone = game.played.map((played) => mapToClone(played));
        try {
            const [want, data] = await this.handler.wantCard(card, isTurn, game.transformToHandlerData(this.position));

            game.data[this.position] = data ? data : {};

            return want;
        } catch (e) {
            // tslint:disable-next-line
            console.error(e); 
            return false;
        }
    }

    /**
     * Pass a message on to the handler
     * @param bundle the message
     */
    public message(bundle: Message) {
        try {
            this.handler.message(bundle);
        } catch (e) {
            // tslint:disable-next-line
            console.error(e);
        }
    }

    /**
     * Allow the handler to make its turn, and handle errors with default behavior
     * @param game the current game state
     */
    public async turn(game: GameState): Promise<{discard: Card | null, played: Card[][][] | null}> {
        // set up copies
        const handClone = game.hands[this.position].slice();
        const playedClone = game.played.map((played) => mapToClone(played));

        try {
            // call handler
            const turn = await this.handler.turn(game.transformToHandlerData(this.position));
            if (!turn) {
                throw new Error();
            }
            const {toDiscard, toPlay, data} = turn;

            game.data[this.position] = data ? data : {};

            // run check on state
            game.hands[this.position] = this.checkTurn(toDiscard, toPlay, game);

            // figure out what changed to send up to the game handler
            // TODO can this be worked into checkTurn without making too clunky?
            const playedChanged = zip(game.played, toPlay)
                .map(([old, modified]) => zip(old, modified)
                .map(([oldRun, modifiedRun]) => {
                    return modifiedRun.cards.filter(card => oldRun.cards.find(other => card.equals(other)) === undefined);
                }
            ));

            // update played
           game.played = toPlay;

            return {discard: toDiscard, played: playedChanged};
        } catch (e) {
            // handle if invalid
            // tslint:disable-next-line
            console.error(e);

            const liveForNone = (card: Card) => !game.played.some((runs) => runs.some((play) => play.isLive(card)));
            const possibleDiscard = game.hands[this.position].find(liveForNone) || null;

            return {discard: possibleDiscard, played: null};
        }
    }

    /**
     * Get the handler's name with sensible defaults
     */
    public toString() {
        const name = this.handler.getName();
        if (!!name) {
            return name;
        } else {
            return 'Unnamed player #' + this.position;
        }
    }

    /**
     * Checks whether moves made by the handler are legal
     * @param toDiscard the card the handler is attempting to discard
     * @param toPlay the cards on the table after the handler is finished making its turn
     * @param game the game state as it was
     */
    private checkTurn(
        toDiscard: Card | null,
        toPlay: Run[][],
        game: GameState,
    ) {
        const runningHand: Card[] = game.hands[this.position].slice();

        if (toPlay[this.position].length) {
            for (const [run, type] of zip(toPlay[this.position], game.getRound())) {
                if(run.type !== type) {
                    throw new InvalidError('Run is of the wrong type');
                }
                checkRun(run);
            }
            // figure out cards now played that were not played before
            const changedCards = [];

            for(let player = 0; player < game.numPlayers; player++) {
                if(player === this.position || game.played[player].length > 0){
                    for(let run = 0; run < toPlay[player].length; run++) {
                        const newPlayCards = [...toPlay[player][run].cards];
                        if(game.played[player][run]) {
                            for (const card of game.played[player][run].cards) {
                                checkExistenceAndRemove(newPlayCards, card);
                            }
                        }
                        changedCards.push(...newPlayCards);
                    }
                }
            }
            for (const card of changedCards) {
                checkExistenceAndRemove(runningHand, card);
            }
        }

        if (runningHand.length && toDiscard == null) {
            throw new InvalidError('Must discard');
        }
        if (game.isLastRound() && toPlay && toDiscard !== null) {
            throw new InvalidError('Cannot discard with play on the last round');
        }
        if(toDiscard) {
            for (const plays of toPlay) {
                for(const run of plays) {
                    if(run.isLive(toDiscard)) {
                        throw new InvalidError('Card is live');
                    }
                }
            }
            checkExistenceAndRemove(runningHand, toDiscard);
        }

        return runningHand;
    }
}
