import Deck from './deck';
import Hand from './hand';

function rotate(li: any[], x: number) {
    const firstPart = li.slice(0, x);
    const lastPart = li.slice(x);
    return [...lastPart, ...firstPart];
}

export default class Game {
    public static readonly rounds: number[][] = [ [3, 3], [3, 4], [4, 4], [3, 3, 3], [3, 3, 4], [3, 4, 4], [4, 4, 4] ];
    public round: number = 0;
    public players: Hand[];
    public deck: Deck = new Deck(0);
    public dealer: number;

    constructor(players: Hand[]) {
        this.players = players; // [ new Hand(new ConsoleHandler()), Hand(Third_AI()) for player in range(1, players) ]
        this.dealer = 0;
    }

    public dealOut() {
        this.deck = new Deck(2);
        this.players.forEach((p) => p.message([this.players[this.dealer].toString(), 'is dealer']));
        for (let num = 0; num < this.getNumToDeal(); num++) {
            for (let player = 0; player < this.players.length; player++) {
                // use rotate(this.players, this.round) to be more game realistic
                const offset = this.dealer + 1;
                const hand: Hand = this.players[(player + offset) % this.players.length];
                const card = this.deck.draw();
                // print(player, 'was dealt', card)//adjust visibility
                hand.dealCard(card, undefined, true);
            }
        }
    }

    public getNumToDeal() {
        const roundNeeded = this.getRound().reduce((one, two) => one + two, 0);
        if (this.getRound() === Game.rounds[-1]) {
            return roundNeeded; // on the last hand,
        }
        return roundNeeded + 1;
    }

    // TODO rename
    public isLastRound() {
        return this.round === Game.rounds.length - 1;
    }

    public nextRound() {
        this.round += 1;
        this.dealer = (this.dealer + 1) % this.players.length;
        this.players.forEach((p) => p.message(['Starting round:', this.getRound()]));
        return this.getRound();
    }

    public getRound() {
        return Game.rounds[this.round];
    }

    public isRoundOver() { // could be improved to only check who has changed
        for (const player of this.players) {
            if (player.hand.length === 0) {
                this.players.forEach((p) => p.message([player, 'is out of cards']));
                return true;
            }
        }
        return false;
    }
}
