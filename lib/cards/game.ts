import { Hand } from './hand';
import { Deck } from './deck';
import { Handler } from './handlers/handler';
import { InvalidError } from './invalid-error';
import { Message } from './messages/message';
import { ReshuffleMessage } from './messages/reshuffle-message';

function messageAll(players: Hand[], bundle: Message) {
    players.forEach((player) => player.message(bundle));
}

function rotate(li: any[], x: number) {
    const firstPart = li.slice(0, x);
    const lastPart = li.slice(x);
    return [...lastPart, ...firstPart];
}

export class Game {
    public static readonly rounds: (3 | 4)[][] = [ [3, 3], [3, 4], [4, 4], [3, 3, 3], [3, 3, 4], [3, 4, 4], [4, 4, 4] ];
    public round: number = 0;
    public players: Hand[];
    public deck: Deck = new Deck(0);
    public dealer: number;

    constructor(players: Handler[]) {
        this.players = players.map((handler, i) => new Hand(handler, i));
        // [ new Hand(new ConsoleHandler()), Hand(Third_AI()) for player in range(1, players) ]
        this.dealer = 0;
    }

    public dealOut() {
        this.deck = new Deck(2);
        this.players.forEach((p) => p.message(new Message(this.players[this.dealer].toString() + ' is dealer')));
        for (let num = 0; num < this.getNumToDeal(); num++) {
            for (let player = 0; player < this.players.length; player++) {
                const offset = this.dealer + 1;
                const hand: Hand = this.players[(player + offset) % this.players.length];
                let card = this.deck.draw();
                if (!card) {
                    if(this.deck.shuffleDiscard()) {
                        // TODO add another deck?
                        throw new InvalidError('Deck ran out of cards');
                    } else {
                        messageAll(this.players, new ReshuffleMessage());
                        card = this.deck.draw();
                    }
                }
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
        return this.getRound();
    }

    public getRound() {
        return Game.rounds[this.round];
    }

    public isRoundOver() { // could be improved to only check who has changed
        for (const player of this.players) {
            if (player.hand.length === 0) {
                this.players.forEach((p) => p.message(new Message(player.toString() + ' is out of cards')));
                return true;
            }
        }
        return false;
    }
}
