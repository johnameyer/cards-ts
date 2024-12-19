import { Controllers } from './controllers/controllers.js';
import { getTeamFor } from './util/teams.js';
import { winningPlay } from './util/winning-play.js';
import { GoingAloneMessage, OrderUpMessage, PassMessage, PlayedMessage, TrumpMessage, WonRoundMessage, WonTrickMessage } from './messages/status/index.js';
import { TurnUpMessage, SpacingMessage, LeadsMessage, EndRoundMessage } from '@cards-ts/core';
import { loop, sequence, handleRoundRobinFirst, handleSingle, handleRoundRobin, game, Machine, NestedMachine, named } from '@cards-ts/state-machine';

const hasBidder = (controllers: Controllers) => controllers.euchre.bidder !== undefined;

const nameTrump = named<Controllers>('bidding', {
    start: 'dealOut',
    states: {
        dealOut: {
            run: controllers => {
                controllers.deck.resetDeck();
                controllers.hand.dealOut(true, true, 5); // TODO take from params?
                
                controllers.euchre.flip();
                
                controllers.tricksTaken.reset();
            },
            defaultTransition: 'orderUp',
        },
        orderUp: {
            run: handleRoundRobinFirst<Controllers>({
                // id: 'order-up', // these can probably be left off for the handler arg if we handle collisions
                handler: 'orderUp',
                controller: controllers => controllers.turn,
                startingPosition: controllers => (controllers.deck.dealer + 1) % controllers.players.count,
                // afterEach: controllers => { /* message (incl. going along) */ },
                hasResponded: hasBidder,
                beforeAll: controllers => {
                    controllers.players.messageAll(new TurnUpMessage(controllers.euchre.flippedCard));
                    controllers.trick.resetTurn();
                },
                afterPass: controllers => controllers.players.messageAll(new PassMessage(controllers.names.get(controllers.turn.get()))),
                afterResponse: controllers => {
                    controllers.players.messageAll(new OrderUpMessage(controllers.names.get(controllers.turn.get())));
                    if(controllers.euchre.goingAlone !== undefined) {
                        controllers.players.messageAll(new GoingAloneMessage(controllers.names.get(controllers.turn.get())));
                    }
                    controllers.players.messageAll(new TrumpMessage(controllers.euchre.currentTrump));
                },
            }),
            transitions: [{
                state: 'dealerDiscard',
                condition: hasBidder,
            }],
            defaultTransition: 'nameTrump',
        },
        nameTrump: {
            run: handleRoundRobinFirst({
                handler: 'nameTrump',
                controller: controllers => controllers.turn,
                startingPosition: controllers => (controllers.deck.dealer + 1) % controllers.players.count,
                hasResponded: hasBidder,
                afterPass: controllers => controllers.players.messageAll(new PassMessage(controllers.names.get(controllers.turn.get()))),
                afterResponse: controllers => {
                    controllers.players.messageAll(new OrderUpMessage(controllers.names.get(controllers.turn.get())));
                    if(controllers.euchre.goingAlone !== undefined) {
                        controllers.players.messageAll(new GoingAloneMessage(controllers.names.get(controllers.turn.get())));
                    }
                    controllers.players.messageAll(new TrumpMessage(controllers.euchre.currentTrump));
                },
            }),
            // TODO is there any way to reference external nodes here to avoid having the incorrect / impossible transitions from afterResponse -> misdeal and afterNone -> trumpNamed
            transitions: [{
                state: 'trumpNamed',
                condition: hasBidder,
            }],
            defaultTransition: 'misdeal',
        },
        dealerDiscard: {
            run: handleSingle({ // TODO better terminology
                handler: 'dealerDiscard',
                position: controllers => controllers.deck.dealer,
                after: controllers => controllers.hand.giveCards(controllers.deck.dealer, [ controllers.euchre.flippedCard ]), // plays into #116
            }) as Machine<Controllers>,
        },
        trumpNamed: {},
        misdeal: {
            run: controllers => {
                /* send message about no card being selected */
                /* transition to reset then orderUp state */
                console.log('Misdeal!');
            },
            defaultTransition: 'dealOut',
        },
    },
});


const tricks = loop<Controllers>({
    id: 'trick',
    breakingIf: controllers => controllers.hand.numberOfPlayersWithCards() < controllers.players.count,
    beforeAll: controllers => {
        controllers.trick.resetLeader();
        while(!isPlayingThisRound(controllers.trick.leader, controllers)) {
            controllers.trick.leader++;
        }
    },
    beforeEach: controllers => {
        controllers.players.messageAll(new SpacingMessage());
        controllers.players.messageAll(new LeadsMessage(controllers.names.get(controllers.trick.leader)));
        controllers.trick.resetTrick();
        controllers.trick.resetTurn();
    },
    run: handleRoundRobin({
        handler: 'turn',
        controller: controllers => controllers.turn,
        startingPosition: controllers => controllers.trick.leader,
        skipIf: controllers => !isPlayingThisRound(controllers.turn.get(), controllers),
        /* 
        *ifNotPlaying?
        *Or just loop?
        *
        *controllers.trick.addCard(undefined);
        *controllers.state.set(GameStates.END_PLAY);
        *
        */
        afterEach: controllers => {
            const playedCard = controllers.trick.handlePlayed();
            controllers.players.messageOthers(controllers.turn.get(), new PlayedMessage(controllers.names.get(controllers.turn.get()), playedCard));
        },
    }),
    afterEach: controllers => {
        controllers.trick.incrementTricks();
        
        const winner = (controllers.trick.leader + winningPlay(controllers.trick.currentTrick, controllers.euchre.currentTrump)) % controllers.players.count;
        
        controllers.players.messageAll(new WonTrickMessage(controllers.names.get(winner)));
        
        controllers.trick.leader = winner;
        controllers.tricksTaken.increaseScore(getTeamFor(winner, controllers.params.get()), 1);
    },
});

const round = loop<Controllers>({
    id: 'round', // core element is a round
    run: sequence([
        nameTrump,
        tricks,
    ]),
    afterEach: controllers => {
        const bidderTeam = getTeamFor(controllers.euchre.bidder as number, controllers.params.get());
        
        let winnerPlayer = 0;
        
        for(let i = 1; i < controllers.players.count; i++) {
            if(controllers.tricksTaken.get(i) > controllers.tricksTaken.get(winnerPlayer)) {
                winnerPlayer = i;
            }
        }
        
        const points = calculatePoints(bidderTeam, winnerPlayer, controllers);
        const winnerTeam = getTeamFor(winnerPlayer, controllers.params.get());
        // TODO rework this to group players
        controllers.score.increaseScore(winnerTeam, points);
        
        controllers.players.messageAll(new WonRoundMessage(winnerTeam.map(i => controllers.names.get(i)), points));
        
        controllers.players.messageAll(new EndRoundMessage(controllers.names.get(), controllers.score.get()));
        controllers.players.messageAll(new SpacingMessage());
        
        controllers.deck.incrementDealer();
        
        // TODO add scopes for handlers
        controllers.trick.reset();
        controllers.euchre.reset();
    },
    breakingIf: controllers => controllers.score.playersOver(controllers.params.get().maxScore).length > 0,
});

export const stateMachine = game<Controllers>(
    undefined, // start game - state should already be clean so no-op
    round,
    controllers => { 
        // TODO winner message?
    },
);

function calculatePoints(bidderTeam: number[], winner: number, controllers: Controllers) {
    if(bidderTeam.includes(winner)) {
        if(controllers.tricksTaken.get(winner) === 5) {
            if(controllers.euchre.goingAlone) {
                return 4;
            }
            return 2;
        }
        return 1;
    } 
    return 2;
    // 'euchred'
}

function isPlayingThisRound(position: number, controllers: Controllers) {
    if(controllers.euchre.goingAlone === undefined) {
        return true;
    }
    if(position === controllers.euchre.goingAlone) {
        return true;
    }
    if(getTeamFor(position, controllers.params.get()) !== getTeamFor(controllers.euchre.goingAlone, controllers.params.get())) {
        return true;
    }
    return false;
}
