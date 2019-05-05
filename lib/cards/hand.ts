import { Card } from './card';
import Game from './game';
import Handler from './handler';
import Run from './run';

export default class Hand {
    public score: number;
    public hand: Card[] = [];
    public played: Run[] = [];

    constructor(private readonly handler: Handler, public name: string = '') {
        this.score = 0;
        handler.name().then((handlerName) => this.name = handlerName);
        this.resetHand();
    }

    public resetHand() {
        this.hand = [];
        this.played = []; // this is where the three of a kind, four card runs are played
    }

    public async wantCard(card: Card, game: Game, isTurn: boolean = false): Promise<boolean> {
        try {
            const toReturn: boolean = await this.handler.wantCard(card, this.hand.slice(), this.played.slice(), game.getRound(), isTurn, game.isLastRound());
            return toReturn;
        } catch {
            return false;
        }
    }

    public dealCard(card: Card, extra?: Card, dealt = false) {
        this.hand.push(card);
        if (extra) {
            this.hand.push(extra);
        }
        try {
            this.handler.dealCard(card, extra, dealt);
        } catch {
            return;
        }
    }

    public message(bundle: any) {
        this.handler.message(bundle);
    }

    public async turn(game: Game): Promise<Card> {
        // set up copies
        const handClone = this.hand.slice();
        const playedClone = this.played.map((run) => run.clone());
        const otherPlayed = game.players.map((player) => player.played);
        const otherPlayedClone = game.players.map((player) => player.played.slice());

        try {
            // call handler
            const {toDiscard, toPlay, forOthers} = await this.handler.turn(handClone, playedClone, otherPlayedClone, game.getRound(), game.isRoundOver());

            // run check on state
            this.checkTurn(toDiscard, toPlay, forOthers, game);

            return toDiscard;
        } catch (e) {
            // handle if invalid

            const liveForNone = (card: Card) => otherPlayed.some((played) => played.some((play) => play.isLive(card)));
            const possibleDiscard = this.hand.filter(liveForNone)[0];
            // might use version that only filters as we go

            return possibleDiscard;
        }
    }

    public value(): number {
        return this.hand.map((card) => card.rank.value).reduce((a, b) => a + b, 0);
    }

    private checkTurn(toDiscard: Card, toPlay: Run[], forOthers: Run[][], game: Game) {
        return false;
    }
}
