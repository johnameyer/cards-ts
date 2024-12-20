import { Controllers } from './controllers/controllers.js';
import { NoPassingMessage, PassedMessage, PassingMessage, PlayedMessage, ScoredMessage, ShotTheMoonMessage } from './messages/status/index.js';
import { valueOfCard } from './util/value-of-card.js';
import { conditionalState, sequence, handleAll, handleRoundRobin, loop, game, named } from '@cards-ts/state-machine';
import { Card, Suit, Rank, SpacingMessage, LeadsMessage, EndRoundMessage } from '@cards-ts/core';

const canEndRound = (controllers: Controllers) => controllers.hand.numberOfPlayersWithCards() === 0
|| controllers.params.get().quickEnd && !controllers.hand.get().flatMap(hand => hand)
.map(valueOfCard)
.some(value => value > 0);

const passingRound = handleAll<Controllers>({
    handler: 'pass',
    before: controllers => {
        controllers.passing.resetPassed();
        controllers.players.messageAll(new PassingMessage(controllers.params.get().numToPass, controllers.passing.pass, controllers.players.count));
    },
    after: controllers => {
        for(let player = 0; player < controllers.players.count; player++) {
            // TODO consider rolling this all into passing controller
            const passedFrom = (player + controllers.passing.pass + controllers.players.count) % controllers.players.count; // TODO consider +- here
            const passed = controllers.passing.passed[passedFrom];
            controllers.hand.removeCards(passedFrom, passed);
            controllers.players.message(player, new PassedMessage(passed, controllers.names.get()[passedFrom]));
            controllers.hand.giveCards(player, passed);
        }
        
        controllers.trick.resetTrick();
        controllers.trick.resetLeader();
    },
})

const pass = conditionalState<Controllers>({
    id: 'pass',
    condition: controllers => controllers.passing.pass !== 0,
    truthy: 'run' in passingRound ? passingRound.run : passingRound,
    falsey: controllers => {
        controllers.players.messageAll(new NoPassingMessage());
    },
});

const afterTurn = named<Controllers>('AFTER_TURN', controllers => {
    const whoseTurn = controllers.turn.get();
    const played = controllers.trick.handlePlayed();
    controllers.players.messageOthers(whoseTurn, new PlayedMessage(controllers.names.get()[whoseTurn], played));
});

const turn = {
    handler: 'turn',
    startingPosition: controllers => controllers.trick.leader,
    controller: controllers => controllers.turn,
    // @ts-ignore
    afterEach: afterTurn.run,
} satisfies Partial<Parameters<typeof handleRoundRobin<Controllers>>[0]>;

const endTrick = named<Controllers>('END_TRICK', controllers => {
    controllers.trick.incrementTricks();
    
    const winner = controllers.trick.findWinner((card, highest) => card.rank.order > highest.rank.order);
    
    const newLeader = (winner + controllers.trick.leader) % controllers.players.count;
    controllers.trickPoints.increaseScore(newLeader, (controllers.trick.currentTrick as Card[]).map(valueOfCard).reduce((a, b) => a + b, 0));
    controllers.trick.leader = newLeader;
});

// The player with the 2 of Clubs leads the first trick so we manually play that card for them
const firstTrick = sequence([
    named<Controllers>('LEAD_OFF', controllers => {
        const startingCard = new Card(Suit.CLUBS, Rank.TWO);
        const leader = controllers.hand.hasCard(startingCard);
        controllers.trick.leader = leader;
        
        controllers.players.messageAll(new SpacingMessage());
        controllers.players.messageAll(new LeadsMessage(controllers.names.get()[leader]));
        
        controllers.trick.setPlayedCard(startingCard);
    }),
    afterTurn,
    // first trick
    handleRoundRobin({
        ...turn,
        skipIf: (controllers: Controllers) => controllers.turn.get() === controllers.trick.leader, // TODO remove and just iterate through the three players
        // TODO afterAll
    }),
    endTrick,
]);

const tricks = sequence<Controllers>([
    named('FIRST_TRICK', firstTrick),
    loop<Controllers>({
        id: 'trick',
        beforeEach: controllers => {
            controllers.players.messageAll(new SpacingMessage());
            controllers.players.messageAll(new LeadsMessage(controllers.names.get(controllers.trick.leader)));
            controllers.trick.resetTrick();
        },
        breakingIf: canEndRound,
        run: handleRoundRobin({
            ...turn,
        }),
        // @ts-ignore
        afterEach: endTrick.run,
    }),
]);

const round = loop<Controllers>({
    id: 'round',
    beforeEach: controllers => {
        controllers.deck.resetDeck();
        controllers.hand.dealOut(true, true);
        
        controllers.trickPoints.reset();
    },
    breakingIf: controllers => controllers.score.playersOver(controllers.params.get().maxScore).length > 0,
    run: sequence([
        pass,
        {
            name: 'tricks',
            ...tricks,
        },
    ]),
    afterEach: controllers => {
        controllers.trick.reset();
        
        for(let player = 0; player < controllers.players.count; player++) {
            const newPoints = controllers.trickPoints.get(player);
            
            if(newPoints === 26) { // MAX POINTS, not set upfront but by the number of cards in the deck
                for(let otherPlayer = 0; otherPlayer < controllers.players.count; otherPlayer++) {
                    if(otherPlayer !== player) {
                        controllers.score.increaseScore(otherPlayer, newPoints);
                    }
                }
                controllers.players.messageAll(new ShotTheMoonMessage(controllers.names.get()[player]));
            } else {
                controllers.score.increaseScore(player, newPoints);
                controllers.players.message(player, new ScoredMessage(newPoints));
            }
        }
        
        controllers.players.messageAll(new EndRoundMessage(controllers.names.get(), controllers.score.get()));
        
        controllers.passing.nextPass();
    },
});

export const stateMachine = game<Controllers>(
    undefined, // start game - state should already be clean so no-op
    round,
    controllers => { 
        // winner message?
    },
);
