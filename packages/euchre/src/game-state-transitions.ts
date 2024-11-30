import { GameStates } from './game-states.js';
import { PlayedMessage, OrderUpMessage, PassMessage, NameTrumpMessage, TrumpMessage, WonTrickMessage, WonRoundMessage, GoingAloneMessage } from './messages/status/index.js';
import { getTeamFor } from './util/teams.js';
import { winningPlay } from './util/winning-play.js';
import { Controllers } from './controllers/controllers.js';
import { SpacingMessage, GenericGameStateTransitions, TurnUpMessage, LeadsMessage, EndRoundMessage } from '@cards-ts/core';

export const gameStateTransitions: GenericGameStateTransitions<typeof GameStates, Controllers> = {
    [GameStates.START_GAME]: (controllers) => {
        controllers.state.set(GameStates.START_ROUND);
    },

    [GameStates.START_ROUND]: (controllers) => {
        controllers.deck.resetDeck();
        controllers.hand.dealOut(true, true, 5); // TODO take from params?

        controllers.euchre.flip();

        controllers.tricksTaken.reset();

        controllers.trick.resetLeader();
        while(!isPlayingThisRound(controllers.trick.leader, controllers)) {
            controllers.trick.leader++;
        }

        controllers.state.set(GameStates.START_ORDERING_UP);
    },

    [GameStates.START_ORDERING_UP]: (controllers) => {
        controllers.players.messageAll(new TurnUpMessage(controllers.euchre.flippedCard));

        controllers.state.set(GameStates.WAIT_FOR_ORDER_UP);
        controllers.trick.resetTurn();
    },

    [GameStates.WAIT_FOR_ORDER_UP]: (controllers) => {
        controllers.players.handlerCall(controllers.turn.get(), 'orderUp');
        
        controllers.state.set(GameStates.HANDLE_ORDER_UP);
    },

    [GameStates.HANDLE_ORDER_UP]: (controllers) => {
        if(controllers.euchre.bidder !== undefined) {
            controllers.players.messageAll(new OrderUpMessage(controllers.names.get(controllers.turn.get())));
            if(controllers.euchre.goingAlone !== undefined) {
                controllers.players.messageAll(new GoingAloneMessage(controllers.names.get(controllers.turn.get())));
            }
            controllers.players.messageAll(new TrumpMessage(controllers.euchre.currentTrump));
            controllers.state.set(GameStates.WAIT_FOR_DEALER_DISCARD);
        } else {
            controllers.players.messageAll(new PassMessage(controllers.names.get(controllers.turn.get())));
            if(controllers.turn.get() === controllers.deck.dealer) {
                controllers.state.set(GameStates.START_TRUMP_NAMING);
            } else {
                controllers.turn.next();
                controllers.state.set(GameStates.WAIT_FOR_ORDER_UP);
            }
        }
    },

    [GameStates.WAIT_FOR_DEALER_DISCARD]: (controllers) => {
        controllers.turn.set(controllers.deck.dealer); // TODO rework this with the event handler logic

        controllers.players.handlerCall(controllers.deck.dealer, 'dealerDiscard');
        
        controllers.state.set(GameStates.HANDLE_DEALER_DISCARD);
    },

    [GameStates.HANDLE_DEALER_DISCARD]: (controllers) => {
        controllers.hand.giveCards(controllers.deck.dealer, [ controllers.euchre.flippedCard ]);

        controllers.state.set(GameStates.START_TRICK);
    },

    [GameStates.START_TRUMP_NAMING]: (controllers) => {
        controllers.state.set(GameStates.WAIT_FOR_TRUMP_NAMING);
        controllers.trick.resetTurn();
    },

    [GameStates.WAIT_FOR_TRUMP_NAMING]: (controllers) => {
        controllers.players.handlerCall(controllers.turn.get(), 'nameTrump');
        
        controllers.state.set(GameStates.HANDLE_TRUMP_NAMING);
    },

    [GameStates.HANDLE_TRUMP_NAMING]: (controllers) => {
        if(controllers.euchre.bidder !== undefined) {
            controllers.players.messageAll(new NameTrumpMessage(controllers.names.get(controllers.turn.get()), controllers.euchre.currentTrump));
            if(controllers.euchre.goingAlone !== undefined) {
                controllers.players.messageAll(new GoingAloneMessage(controllers.names.get(controllers.turn.get())));
            }
            controllers.state.set(GameStates.START_TRICK);
        } else {
            controllers.players.messageAll(new PassMessage(controllers.names.get(controllers.turn.get())));
            if(controllers.turn.get() === controllers.deck.dealer) {
                // this depends e.g. misdeal
                controllers.state.set(GameStates.START_ROUND);
            } else {
                controllers.turn.next();
                controllers.state.set(GameStates.WAIT_FOR_TRUMP_NAMING);
            }
        }
    },

    [GameStates.START_TRICK]: (controllers) => {
        controllers.players.messageAll(new SpacingMessage());
        controllers.players.messageAll(new LeadsMessage(controllers.names.get(controllers.trick.leader)));
        controllers.trick.resetTrick();
        controllers.trick.resetTurn();

        controllers.state.set(GameStates.START_PLAY);
    },

    [GameStates.START_PLAY]: (controllers) => {
        if(isPlayingThisRound(controllers.turn.get(), controllers)) {
            controllers.state.set(GameStates.WAIT_FOR_PLAY);
        } else {
            controllers.trick.addCard(undefined);
            controllers.state.set(GameStates.END_PLAY);
        }
    },

    [GameStates.WAIT_FOR_PLAY]: (controllers) => {
        controllers.players.handlerCall(controllers.turn.get(), 'turn');
        
        controllers.state.set(GameStates.HANDLE_PLAY);
    },

    [GameStates.HANDLE_PLAY]: (controllers) => {
        const playedCard = controllers.trick.handlePlayed();
        controllers.players.messageOthers(controllers.turn.get(), new PlayedMessage(controllers.names.get(controllers.turn.get()), playedCard));

        controllers.state.set(GameStates.END_PLAY);
    },

    [GameStates.END_PLAY]: (controllers) => {
        controllers.turn.next();
        if(controllers.trick.trickIsCompleted()) {
            controllers.state.set(GameStates.END_TRICK);
        } else {
            controllers.state.set(GameStates.START_PLAY);
        }
    },

    [GameStates.END_TRICK]: (controllers) => {
        controllers.trick.incrementTricks();

        const winner = (controllers.trick.leader + winningPlay(controllers.trick.currentTrick, controllers.euchre.currentTrump)) % controllers.players.count;

        controllers.players.messageAll(new WonTrickMessage(controllers.names.get(winner)));
        
        controllers.trick.leader = winner;
        controllers.tricksTaken.increaseScore(getTeamFor(winner, controllers.params.get()), 1);

        if(controllers.hand.numberOfPlayersWithCards() < controllers.players.count) {
            controllers.state.set(GameStates.END_ROUND);
        } else {
            controllers.state.set(GameStates.START_TRICK);
        }
    },

    [GameStates.END_ROUND]: (controllers) => {
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
        
        controllers.players.messageAll(new EndRoundMessage({players: controllers.names.get(), scores: controllers.score.get()}));
        controllers.players.messageAll(new SpacingMessage());
        
        if(controllers.score.playersOver(controllers.params.get().maxScore).length) {
            controllers.state.set(GameStates.END_GAME);
        } else {
            controllers.state.set(GameStates.START_ROUND);

            controllers.deck.incrementDealer();
        }

        controllers.trick.reset();
        controllers.euchre.reset();
    },

    [GameStates.END_GAME]: (controllers) => {
        controllers.completed.complete();
    },
};

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
