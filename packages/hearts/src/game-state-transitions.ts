import { GenericGameStateTransitions, Card, Rank, Suit, GenericGameState, SpacingMessage, LeadsMessage } from '@cards-ts/core';
import { GameStates } from './game-states';
import { NoPassingMessage, PassingMessage, PassedMessage, PlayedMessage, ShotTheMoonMessage, ScoredMessage, EndRoundMessage } from './messages/status';
import { Controllers } from './controllers/controllers';

function valueOfCard(card: Card): number {
    if(card.equals(Card.fromString('QS'))) {
        return 13; // NUM OF HEARTS
    }
    if(card.suit === Suit.HEARTS) {
        return 1;
    }
    return 0;
}
type GameState = GenericGameState<Controllers>;

export class GameStateTransitions implements GenericGameStateTransitions<typeof GameStates, Controllers> {
    public get() {
        return {
            [GameStates.START_GAME]: this.startGame,
            [GameStates.START_ROUND]: this.startRound,
            [GameStates.START_PASS]: this.startPass,
            [GameStates.WAIT_FOR_PASS]: this.waitForPass,
            [GameStates.HANDLE_PASS]: this.handlePass,
            [GameStates.START_FIRST_TRICK]: this.startFirstTrick,
            [GameStates.START_TRICK]: this.startTrick,
            [GameStates.START_PLAY]: this.startPlay,
            [GameStates.WAIT_FOR_PLAY]: this.waitForPlay,
            [GameStates.HANDLE_PLAY]: this.handlePlay,
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
        controllers.hand.dealOut(true, true);

        controllers.trickPoints.reset();

        if(controllers.passing.pass === 0) {
            controllers.state.set(GameStates.START_FIRST_TRICK);
            controllers.players.messageAll(new NoPassingMessage());
        } else {
            controllers.state.set(GameStates.START_PASS);
        }
    }

    startPass(controllers: Controllers) {
        controllers.players.messageAll(new PassingMessage(controllers.params.get().numToPass, controllers.passing.pass, controllers.players.count));

        controllers.state.set(GameStates.WAIT_FOR_PASS);
        controllers.passing.resetPassed();
    }

    waitForPass(controllers: Controllers) {
        controllers.players.handlerCallAll('pass');
        
        controllers.state.set(GameStates.HANDLE_PASS);
    }

    handlePass(controllers: Controllers) {
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
        controllers.state.set(GameStates.START_FIRST_TRICK);
    }

    startFirstTrick(controllers: Controllers) {
        const startingCard = new Card(Suit.CLUBS, Rank.TWO);
        const leader = controllers.hand.hasCard(startingCard);
        controllers.trick.leader = leader;
        
        controllers.players.messageAll(new SpacingMessage());
        controllers.players.messageAll(new LeadsMessage(controllers.names.get()[leader]));

        controllers.hand.removeCards(leader, [ startingCard ]);
        controllers.trick.addCard(startingCard);
        controllers.players.messageOthers(leader, new PlayedMessage(controllers.names.get(leader), startingCard));

        controllers.turn.next();

        controllers.state.set(GameStates.START_PLAY);
    }

    startTrick(controllers: Controllers) {
        controllers.players.messageAll(new SpacingMessage());
        controllers.players.messageAll(new LeadsMessage(controllers.names.get(controllers.trick.leader)));
        controllers.trick.resetTrick();

        controllers.state.set(GameStates.START_PLAY);
    }

    startPlay(controllers: Controllers) {
        controllers.state.set(GameStates.WAIT_FOR_PLAY);
    }

    waitForPlay(controllers: Controllers) {
        controllers.players.handlerCall(controllers.turn.get(), 'turn');
        
        controllers.state.set(GameStates.HANDLE_PLAY);
    }

    handlePlay(controllers: Controllers) {
        const whoseTurn = controllers.turn.get();
        const played = controllers.trick.handlePlayed();
        controllers.players.messageOthers(whoseTurn, new PlayedMessage(controllers.names.get()[whoseTurn], played));

        controllers.turn.next();
        if(controllers.trick.trickIsCompleted()) {
            controllers.state.set(GameStates.END_TRICK);
        } else {
            controllers.state.set(GameStates.START_PLAY);
        }
    }

    endTrick(controllers: Controllers) {
        controllers.trick.incrementTricks();
        
        const winner = controllers.trick.findWinner((card, highest) => card.rank.order > highest.rank.order);

        const newLeader = (winner + controllers.trick.leader) % controllers.players.count;
        controllers.trickPoints.increaseScore(newLeader, (controllers.trick.currentTrick as Card[]).map(valueOfCard).reduce((a, b) => a + b, 0));
        controllers.trick.leader = newLeader;

        if(controllers.params.get().quickEnd && !controllers.hand.get().flatMap(hand => hand)
            .map(valueOfCard)
            .some(value => value >= 0)) {
            // might be nice to have a message here if round ends early
            controllers.state.set(GameStates.END_ROUND);
        } else if(controllers.hand.numberOfPlayersWithCards() === 0) {
            controllers.state.set(GameStates.END_ROUND);
        } else {
            controllers.state.set(GameStates.START_TRICK);
        }
    }

    endRound(controllers: Controllers) {
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
        
        if(controllers.score.get().some(points => points >= controllers.params.get().maxScore)) {
            controllers.state.set(GameStates.END_GAME);
        } else {
            controllers.state.set(GameStates.START_ROUND);
        }   
    }

    endGame(controllers: Controllers) {
        controllers.completed.complete();
    }

}
