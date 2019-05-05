import Game from './game';
import Hand from './hand';

function messageAll(players: Hand[], bundle: any) {
    players.forEach((player) => player.message(bundle));
}

export default async function main() {
    const g = new Game([]);

    for (const player of g.players) {
        player.message( ['Starting round:', g.getRound()] );
    }
    while (!g.isRoundOver()) {
        g.dealOut();
        g.deck.discard(g.deck.draw());

        for (const player of g.players) {
            player.message(['First card is', g.deck.top]);
        }
        let whoseTurn: number = g.dealer + 1;
        while (!g.isLastRound()) {
            // first player after dealer gets first pick

            const card = g.deck.top;
            if (card == null) {
                throw new Error('null card');
            }
            if (await g.players[whoseTurn].wantCard(card, g)) {
                messageAll(g.players, [g.players[whoseTurn], 'picked up the', card]);
                g.players[whoseTurn].dealCard(card);
                g.deck.takeTop();
            } else {
                for (let i = 0; i < g.players.length - 1; i ++) {
                    // account for flipped discard vs normal discard with dealer
                    const player = g.players[(i + whoseTurn + 1) % g.players.length];
                    if (player.wantCard(card, g, true)) {
                        messageAll(g.players, [player, 'grabbed the', card, 'and an extra']);
                        player.dealCard(card, g.deck.draw());
                        g.deck.takeTop();
                    }
                }
                if (g.deck.top) {
                    messageAll(g.players, ['No player grabbed the card']);
                    g.players[whoseTurn].dealCard(g.deck.draw());
                }
            }

            const discard = await g.players[whoseTurn].turn(g);

            // check for final round
            g.deck.discard(discard);
            messageAll(g.players, [g.players[whoseTurn], 'discarded', discard]);

            whoseTurn = (whoseTurn + 1) % g.players.length;
        }

        g.nextRound();
        for (const player of g.players) {
            player.score += player.value();
            player.resetHand();
        }

        messageAll(g.players, ['Scores', g.players.reduce((arr: any[], person) => {
            arr.push([person.name, person.score]);
            return arr;
        }, [])] );
    }
}
