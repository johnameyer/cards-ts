import { InvalidError } from './invalid-error';
import { Hand } from './hand';
import { Handler } from './handlers/handler';
import { Game } from './game';
import { EndRoundMessage } from './messages/end-round-message';
import { Message } from './messages/message';
import { StartRoundMessage } from './messages/start-round-message';
import { PickupMessage } from './messages/pickup-message';
import { ReshuffleMessage } from './messages/reshuffle-message';
import { DiscardMessage } from './messages/discard-message';
import { PlayedMessage } from './messages/played-message';
import { zip } from './util/zip';

function messageAll(players: Hand[], bundle: Message) {
    players.forEach((player) => player.message(bundle));
}

function messageOthers(players: Hand[], excluded: Hand, bundle: Message) {
    players.forEach((player) => {
        if(player !== excluded)
            player.message(bundle);
    });
}

export async function main(players: Handler[]) {
    const g = new Game(players);

    messageAll(g.players, new StartRoundMessage(g.getRound()) );
    while (!g.isLastRound()) { // while is not game over
        g.dealOut();
        g.deck.discard(g.deck.draw());

        if (g.deck.top === null) {
            throw new Error('Already null');
        }
        const top = g.deck.top;
        messageAll(g.players, new DiscardMessage(top) );

        let whoseTurn: number = (g.dealer + 1) % g.players.length;
        while (!g.isRoundOver()) {
            // first player after dealer gets first pick

            const card = g.deck.top;
            if (await (g.players[whoseTurn].wantCard(card, g))) {
                messageOthers(g.players, g.players[whoseTurn], new PickupMessage(card, g.players[whoseTurn].toString(), false) );
                g.players[whoseTurn].dealCard(card);
                g.deck.takeTop();
            } else {
                for (let i = 0; i < g.players.length - 1; i ++) {
                    const player = g.players[(i + whoseTurn + 1) % g.players.length];
                    if (await (player.wantCard(card, g, true))) {
                        messageOthers(g.players, player, new PickupMessage(card, player.toString(), true) );
                        // tslint:disable-next-line
                        let draw = g.deck.draw();
                        if (!card) {
                            if(g.deck.shuffleDiscard()) {
                                // TODO add another deck?
                                throw new InvalidError('Deck ran out of cards');
                            } else {
                                messageAll(g.players, new ReshuffleMessage() );
                                draw = g.deck.draw();
                            }
                        }
                        player.dealCard(card, draw);
                        g.deck.takeTop();
                        break;
                    }
                }
                if (g.deck.top !== null) {
                    messageAll(g.players, new PickupMessage(g.deck.top));
                    g.deck.clearTop();
                }
                let draw = g.deck.draw();
                if (!draw) {
                    if(g.deck.shuffleDiscard()) {
                        // TODO add another deck?
                        throw new InvalidError('Deck ran out of cards');
                    } else {
                        messageAll(g.players, new ReshuffleMessage());
                        draw = g.deck.draw();
                    }
                }
                g.players[whoseTurn].dealCard(draw);
            }

            const { discard, played } = await g.players[whoseTurn].turn(g);
            if(!discard) {
                // TODO check for final round
                continue;
            }

            g.deck.discard(discard);
            if(played) {
                for(const [player, playedRuns] of zip(g.players, played)) {
                    for(const [run, playedCards] of zip(player.played, playedRuns)) {
                        if(playedCards && playedCards.length) {
                            messageOthers(g.players, g.players[whoseTurn], new PlayedMessage(playedCards, run, g.players[whoseTurn].toString()));
                        }
                    }
                }
            }
            messageOthers(g.players, g.players[whoseTurn], new DiscardMessage(discard, g.players[whoseTurn].toString()));

            whoseTurn = (whoseTurn + 1) % g.players.length;
        }

        g.nextRound();
        for (const player of g.players) {
            player.score += player.value();
            player.resetHand();
        }

        messageAll(g.players, new EndRoundMessage(g.players.map(person => person.toString()), g.players.map(player => player.score)));
    }
}
