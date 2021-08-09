import { SpacingMessage, GenericGameState, GenericGameStateTransitions, TurnUpMessage, LeadsMessage } from '@cards-ts/core';
import { GameStates } from './game-states';
import { PlayedMessage, EndRoundMessage, OrderUpMessage, PassMessage, NameTrumpMessage, TrumpMessage, WonTrickMessage, WonRoundMessage, GoingAloneMessage } from './messages/status';
import { getTeamFor } from './util/teams';
import { winningPlay } from './util/winning-play';
import { Controllers, GameControllers } from './controllers/controllers';

type GameState = GenericGameState<GameControllers>;

export class GameStateTransitions implements GenericGameStateTransitions<typeof GameStates, Controllers> {
    public get() {
        return {
            [GameStates.START_GAME]: this.startGame,
            [GameStates.START_ROUND]: this.startRound,
            [GameStates.START_ORDERING_UP]: this.startOrderingUp,
            [GameStates.WAIT_FOR_ORDER_UP]: this.waitForOrderUp,
            [GameStates.HANDLE_ORDER_UP]: this.handleOrderUp,
            [GameStates.WAIT_FOR_DEALER_DISCARD]: this.waitForDealerDiscard,
            [GameStates.HANDLE_DEALER_DISCARD]: this.handleDealerDiscard,
            [GameStates.START_TRUMP_NAMING]: this.startTrumpNaming,
            [GameStates.WAIT_FOR_TRUMP_NAMING]: this.waitForTrumpNaming,
            [GameStates.HANDLE_TRUMP_NAMING]: this.handleTrumpNaming,
            [GameStates.START_TRICK]: this.startTrick,
            [GameStates.START_PLAY]: this.startPlay,
            [GameStates.WAIT_FOR_PLAY]: this.waitForPlay,
            [GameStates.HANDLE_PLAY]: this.handlePlay,
            [GameStates.END_PLAY]: this.endPlay,
            [GameStates.END_TRICK]: this.endTrick,
            [GameStates.END_ROUND]: this.endRound,
            [GameStates.END_GAME]: this.endGame,
        };
    }

    startGame(controllers: Controllers) {
        controllers.state.set(GameStates.START_ROUND);
    }

    startRound(controllers: Controllers) {
        controllers.deck.resetDeck();
        controllers.hand.dealOut(true, true, 5); // TODO take from params?

        controllers.euchre.flip();

        controllers.tricksTaken.reset();

        controllers.trick.resetLeader();
        while(!isPlayingThisRound(controllers.trick.leader, controllers)) {
            controllers.trick.leader++;
        }

        controllers.state.set(GameStates.START_ORDERING_UP);
    }

    startOrderingUp(controllers: Controllers) {
        controllers.players.messageAll(new TurnUpMessage(controllers.euchre.flippedCard));

        controllers.state.set(GameStates.WAIT_FOR_ORDER_UP);
        controllers.trick.resetTurn();
    }

    waitForOrderUp(controllers: Controllers) {
        controllers.players.handlerCall(controllers.turn.get(), 'orderUp');
        
        controllers.state.set(GameStates.HANDLE_ORDER_UP);
    }

    handleOrderUp(controllers: Controllers) {
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
    }

    waitForDealerDiscard(controllers: Controllers) {
        controllers.turn.set(controllers.deck.dealer); // TODO rework this with the event handler logic

        controllers.players.handlerCall(controllers.deck.dealer, 'dealerDiscard');
        
        controllers.state.set(GameStates.HANDLE_DEALER_DISCARD);
    }

    handleDealerDiscard(controllers: Controllers) {
        controllers.hand.giveCards(controllers.deck.dealer, [ controllers.euchre.flippedCard ]);

        controllers.state.set(GameStates.START_TRICK);
    }

    startTrumpNaming(controllers: Controllers) {
        controllers.state.set(GameStates.WAIT_FOR_TRUMP_NAMING);
        controllers.trick.resetTurn();
    }

    waitForTrumpNaming(controllers: Controllers) {
        controllers.players.handlerCall(controllers.turn.get(), 'nameTrump');
        
        controllers.state.set(GameStates.HANDLE_TRUMP_NAMING);
    }

    handleTrumpNaming(controllers: Controllers) {
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
    }

    startTrick(controllers: Controllers) {
        controllers.players.messageAll(new SpacingMessage());
        controllers.players.messageAll(new LeadsMessage(controllers.names.get(controllers.trick.leader)));
        controllers.trick.resetTrick();
        controllers.trick.resetTurn();

        controllers.state.set(GameStates.START_PLAY);
    }

    startPlay(controllers: Controllers) {
        if(isPlayingThisRound(controllers.turn.get(), controllers)) {
            controllers.state.set(GameStates.WAIT_FOR_PLAY);
        } else {
            controllers.trick.addCard(undefined);
            controllers.state.set(GameStates.END_PLAY);
        }
    }

    waitForPlay(controllers: Controllers) {
        controllers.players.handlerCall(controllers.turn.get(), 'turn');
        
        controllers.state.set(GameStates.HANDLE_PLAY);
    }

    handlePlay(controllers: Controllers) {
        const playedCard = controllers.trick.handlePlayed();
        controllers.players.messageOthers(controllers.turn.get(), new PlayedMessage(controllers.names.get(controllers.turn.get()), playedCard));

        controllers.state.set(GameStates.END_PLAY);
    }

    endPlay(controllers: Controllers) {
        controllers.turn.next();
        if(controllers.trick.trickIsCompleted()) {
            controllers.state.set(GameStates.END_TRICK);
        } else {
            controllers.state.set(GameStates.START_PLAY);
        }
    }

    endTrick(controllers: Controllers) {
        controllers.trick.incrementTricks();

        const winner = (controllers.trick.leader + winningPlay(controllers.trick.currentTrick, controllers.euchre.currentTrump)) % controllers.players.count;

        controllers.players.messageAll(new WonTrickMessage(controllers.names.get(winner)));
        
        controllers.trick.leader = winner;
        controllers.tricksTaken.increaseScore(getTeamFor(winner, controllers.params.get()), 1);

        /*
         * if(controllers.gameParams.quickEnd && !controllers.hands.flatMap(hand => hand).map(valueOfCard).some(value => value >= 0)) {
         *     // might be nice to have a message here if round ends early
         *     controllers.state.set(GameStates.END_ROUND);
         * } else
         */
        if(controllers.hand.numberOfPlayersWithCards() < controllers.players.count) {
            controllers.state.set(GameStates.END_ROUND);
        } else {
            controllers.state.set(GameStates.START_TRICK);
        }
    }

    endRound(controllers: Controllers) {
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
        
        if(controllers.score.playersOver(controllers.params.get().maxScore).length) {
            controllers.state.set(GameStates.END_GAME);
        } else {
            controllers.state.set(GameStates.START_ROUND);

            controllers.deck.incrementDealer();
        }

        controllers.trick.reset();
        controllers.euchre.reset();
    }

    endGame(controllers: Controllers) {
        controllers.completed.complete();
    }

}

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
