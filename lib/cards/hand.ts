import { Card } from './card';
import { Run } from './run';
import { Handler } from './handlers/handler';
import { Game } from './game';
import { checkRun } from './run-util';
import { Message } from './messages/message';
import { DealMessage } from './messages/deal-message';
import { zip } from './util/zip';

const mapToClone = <T extends {clone: () => T}>(arr: T[]) => arr.map((t: T) => t.clone());

export class Hand {
    public score: number;
    /**
     * The cards in this hand
     */
    public hand: Card[] = [];
    /**
     * This is where the three of a kind, four card runs are played
     */
    public played: Run[] = [];

    constructor(private readonly handler: Handler, public position: number) {
        this.score = 0;
        this.resetHand();
    }

    public resetHand() {
        this.hand = [];
        this.played = [];
    }

    public async wantCard(card: Card, game: Game, isTurn: boolean = false): Promise<boolean> {
        const playedClone = game.players.map((player) => mapToClone(player.played));
        try {
            return await this.handler.wantCard(card, this.hand.slice(), playedClone, this.position, game.getRound(), isTurn, game.isLastRound());
        } catch (e) {
            // tslint:disable-next-line
            console.error(e); 
            return false;
        }
    }

    public dealCard(card: Card, extra?: Card, dealt = false) {
        this.hand.push(card);
        if (extra) {
            this.hand.push(extra);
        }
        this.message(new DealMessage(card, extra, dealt));
    }

    public message(bundle: Message) {
        this.handler.message(bundle);
    }

    public async turn(game: Game): Promise<{discard: Card | null, played: Card[][][] | null}> {
        // set up copies
        const handClone = this.hand.slice();
        const played = game.players.map((player) => mapToClone(player.played));
        const playedClone = game.players.map((player) => mapToClone(player.played));

        try {
            // call handler
            const turn = await this.handler.turn(handClone, playedClone, this.position, game.getRound(), game.isRoundOver());
            if (!turn) {
                throw new Error();
            }
            const {toDiscard, toPlay} = turn;

            // run check on state
            this.hand = this.checkTurn(toDiscard, toPlay, game);

            // figure out what changed to send up to the game handler
            // TODO can this be worked into checkTurn without making too clunky
            const playedChanged = zip(game.players, toPlay)
                .map(([old, modified]) => zip(old.played, modified)
                .map(([oldRun, modifiedRun]) => {
                    return modifiedRun.cards.filter(card => oldRun.cards.find(other => card.equals(other)) === undefined);
                }
            ));

            // update played
            for(const [hand, playedRuns] of zip(game.players, toPlay) ) {
                hand.played = playedRuns;
            }

            return {discard: toDiscard, played: playedChanged};
        } catch (e) {
            // handle if invalid
            // tslint:disable-next-line
            console.error(e);

            const liveForNone = (card: Card) => !played.some((runs) => runs.some((play) => play.isLive(card)));
            const possibleDiscard = this.hand.filter(liveForNone)[0];
            // TODO might use version that only filters as we go

            return {discard: possibleDiscard, played: null};
        }
    }

    public value(): number {
        return this.hand.map((card) => card.rank.value).reduce((a, b) => a + b, 0);
    }

    public toString() {
        const name = this.handler.getName() !== null ? this.handler.getName() : null;
        if (name !== null) {
            return name;
        } else {
            return 'Unnamed player #' + this.position;
        }
    }

    private checkTurn(
        toDiscard: Card | null,
        toPlay: Run[][],
        game: Game,
    ) {
        function checkExistenceAndRemove<T extends {equals: (t: T) => boolean}>(tarr: T[], t: T, errorMessage: string = 'Could not find card') {
            const tIndex = tarr.findIndex((ti) => t.equals(ti));
            if (tIndex === -1) {
                throw new Error(errorMessage);
            }
            tarr.splice(tIndex, 1);
        }
        const runningHand: Card[] = this.hand.slice();

        if (toPlay[this.position].length) {
            for (const run of toPlay[this.position]) {
                checkRun(run);
                // TODO check of right type too
            }
            if (this.played.length) {
                // figure out cards now played that were not played before
                const newCardsPlayed = this.played.reduce<Card[]>((newCards, run, index) => {
                    const newPlayCards = [...toPlay[this.position][index].cards];
                    for (const card of run.cards) {
                        checkExistenceAndRemove(newPlayCards, card);
                    }
                    newCards.push(...newPlayCards);
                    return newCards;
                }, []);
                for (const card of newCardsPlayed) {
                    checkExistenceAndRemove(runningHand, card);
                }
            } else {
                for (const run of toPlay[this.position]) {
                    for (const card of run.cards) {
                        checkExistenceAndRemove(runningHand, card);
                    }
                }
            }
        }
        if (toPlay.filter((item, index) => index !== this.position).some((other) => other.length > 0)) {
            for (let i = 0; i < toPlay.length; i++) {
                if (i === this.position) {
                    // already checked our own
                    continue;
                }
                const newOther = mapToClone(toPlay[i]);
                const originalOther = game.players[i].played.map((run) => run.clone());
                if (originalOther.length >= 0) {
                    for (const run of originalOther) {
                        checkRun(run);
                    }
                    const newCardsPlayed = originalOther.reduce<Card[]>((reduction, run, index) => {
                        const toPlayCards = newOther[index].cards;
                        for (const card of run.cards) {
                            checkExistenceAndRemove(toPlayCards, card);
                        }
                        reduction.push(...toPlayCards);
                        return reduction;
                    }, []);
                    for (const card of newCardsPlayed) {
                        checkExistenceAndRemove(runningHand, card);
                    }
                }
            }
        }

        if (runningHand.length && toDiscard == null) {
            throw new Error('must discard');
        }
        if (game.isLastRound() && toPlay && toDiscard !== null) {
            throw new Error('cannot discard on last round');
        }
        if(toDiscard) {
            checkExistenceAndRemove(runningHand, toDiscard);
        }
        // TODO where check discard is not live?

        return runningHand;
    }
}
