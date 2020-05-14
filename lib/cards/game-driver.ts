import { InvalidError } from './invalid-error';
import { Hand } from './hand';
import { Handler } from './handlers/handler';
import { GameState } from './game-state';
import { EndRoundMessage } from './messages/end-round-message';
import { Message } from './messages/message';
import { StartRoundMessage } from './messages/start-round-message';
import { PickupMessage } from './messages/pickup-message';
import { ReshuffleMessage } from './messages/reshuffle-message';
import { DiscardMessage } from './messages/discard-message';
import { PlayedMessage } from './messages/played-message';
import { zip } from './util/zip';
import { GameParams } from './game-params';
import { DealMessage } from './messages/deal-message';
import { Card } from './card';

function messageAll(players: Hand[], bundle: Message) {
    players.forEach((player) => player.message(bundle));
}

function messageOthers(players: Hand[], excluded: Hand, bundle: Message) {
    players.forEach((player) => {
        if(player !== excluded)
            player.message(bundle);
    });
}

export class GameDriver {
    private players: Hand[];
    private gameState: GameState;

    constructor(players: Handler[], gameParams: GameParams) {
        this.gameState = new GameState(players.length, gameParams);
        this.players = players.map((handler, i) => new Hand(handler, i));
    }

    private dealOut() {
        const state = this.gameState;
        this.players.forEach((p) => p.message(new Message(this.players[state.dealer].toString() + ' is dealer')));
        for (let num = 0; num < state.getNumToDeal(); num++) {
            for (let player = 0; player < this.players.length; player++) {
                const offset = state.dealer + 1;
                let card = state.deck.draw();
                if (!card) {
                    if(state.deck.shuffleDiscard()) {
                        // TODO add another deck?
                        throw new InvalidError('Deck ran out of cards');
                    } else {
                        messageAll(this.players, new ReshuffleMessage());
                        card = state.deck.draw();
                    }
                }
                this.giveCard((player + offset) % this.players.length, card, undefined, true);
            }
        }
    }

    private giveCard(player: number, card: Card, extra?: Card, dealt = false) {
        this.gameState.hands[player].push(card);
        if (extra) {
            this.gameState.hands[player].push(extra);
        }
        this.players[player].message(new DealMessage(card, extra, dealt));
    }

    public async start() {
        const state = this.gameState;
        messageAll(this.players, new StartRoundMessage(state.getRound()) );
        while (!state.isLastRound()) { // while is not game over
            state.setupRound();
            this.dealOut();
            state.deck.discard(state.deck.draw());

            if (state.deck.top === null) {
                throw new Error('Already null');
            }
            const top = state.deck.top;
            messageAll(this.players, new DiscardMessage(top) );

            let whoseTurn: number = (state.dealer + 1) % this.players.length;
            while (true) {
                // first player after dealer gets first pick

                const card = state.deck.top;
                if (await (this.players[whoseTurn].wantCard(card, state))) {
                    this.giveCard(whoseTurn, card);
                    messageOthers(this.players, this.players[whoseTurn], new PickupMessage(card, this.players[whoseTurn].toString(), false));
                    state.deck.takeTop();
                } else {
                    for (let i = 0; i < this.players.length - 1; i ++) {
                        const player = this.players[(i + whoseTurn + 1) % this.players.length];
                        if (await (player.wantCard(card, state, true))) {
                            // tslint:disable-next-line
                            let draw = state.deck.draw();
                            if (!draw) {
                                if(state.deck.shuffleDiscard()) {
                                    // TODO add another deck?
                                    throw new InvalidError('Deck ran out of cards');
                                } else {
                                    messageAll(this.players, new ReshuffleMessage() );
                                    draw = state.deck.draw();
                                }
                            }
                            this.giveCard((i + whoseTurn + 1) % this.players.length, card, draw);
                            messageOthers(this.players, this.players[(i + whoseTurn + 1) % this.players.length], new PickupMessage(card, this.players[(i + whoseTurn + 1) % this.players.length].toString(), true));
                            state.deck.takeTop();
                            break;
                        }
                    }
                    if (state.deck.top !== null) {
                        messageAll(this.players, new PickupMessage(state.deck.top));
                        state.deck.clearTop();
                    }
                    let draw = state.deck.draw();
                    if (!draw) {
                        if(state.deck.shuffleDiscard()) {
                            // TODO add another deck?
                            throw new InvalidError('Deck ran out of cards');
                        } else {
                            messageAll(this.players, new ReshuffleMessage());
                            draw = state.deck.draw();
                        }
                    }
                    this.giveCard(whoseTurn, draw);
                }

                const { discard, played } = await this.players[whoseTurn].turn(state);
                if(!discard) {
                    // TODO check for final round
                    continue;
                }

                state.deck.discard(discard);
                if(played) {
                    for(const [player, playedRuns] of zip(state.played, played)) {
                        for(const [run, playedCards] of zip(player, playedRuns)) {
                            if(playedCards && playedCards.length) {
                                messageOthers(this.players, this.players[whoseTurn], new PlayedMessage(playedCards, run, this.players[whoseTurn].toString()));
                            }
                        }
                    }
                }
                messageOthers(this.players, this.players[whoseTurn], new DiscardMessage(discard, this.players[whoseTurn].toString()));

                if(state.hands[whoseTurn].length === 0) {
                    messageAll(this.players, new Message(this.players[whoseTurn].toString() + ' is out of cards'));
                    break;
                }

                whoseTurn = (whoseTurn + 1) % this.players.length;
            }

            state.nextRound();
            for (let player = 0; player < state.numPlayers; player++) {
                state.scores[player] += state.hands[player].map(card => card.rank.value).reduce((a, b) => a + b, 0);
            }

            messageAll(this.players, new EndRoundMessage(this.players.map(person => person.toString()), state.scores));
        }
    }
}