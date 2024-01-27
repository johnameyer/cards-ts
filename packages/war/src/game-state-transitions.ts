import { SpacingMessage, GenericGameState, GenericGameStateTransitions } from '@cards-ts/core';
import { GameStates } from './game-states.js';
import { FlippedMessage, GameOverMessage, StalemateMessage, WonBattleMessage, WonWarMessage } from './messages/status/index.js';
import { Controllers } from './controllers/controllers.js';

type GameState = GenericGameState<Controllers>;

export class GameStateTransitions implements GenericGameStateTransitions<typeof GameStates, Controllers> {
    public get() {
        return {
            [GameStates.START_GAME]: this.startGame,
            [GameStates.START_BATTLE]: this.startBattle,
            [GameStates.START_FLIP]: this.startFlip,
            [GameStates.WAIT_FOR_FLIP]: this.waitForFlip,
            [GameStates.HANDLE_FLIP]: this.handleFlip,
            [GameStates.END_BATTLE]: this.endBattle,
            [GameStates.START_WAR]: this.startWar,
            [GameStates.END_WAR]: this.endWar,
            [GameStates.END_GAME]: this.endGame,
        };
    }

    startGame(controllers: Controllers) {
        controllers.deck.resetDeck();
        controllers.hand.dealOut(false);

        controllers.state.set(GameStates.START_BATTLE);
    }

    startBattle(controllers: Controllers) {
        controllers.war.resetPlayed();

        controllers.state.set(GameStates.START_FLIP);
        
        if(controllers.war.battleCountAndOne > controllers.params.get().maxBattles) {
            controllers.state.set(GameStates.END_GAME);
        }
    }

    startFlip(controllers: Controllers) {
        controllers.state.set(GameStates.WAIT_FOR_FLIP);
    }

    waitForFlip(controllers: Controllers) {
        controllers.players.handlerCallAll('flip');
        
        controllers.state.set(GameStates.HANDLE_FLIP);
    }

    handleFlip(controllers: Controllers) {
        controllers.war.flipCards();

        if(controllers.war.getMaxPlayed() === 1) {
            controllers.state.set(GameStates.END_BATTLE);
        } else if((controllers.war.getMaxPlayed() - 1) % 4 === 0 || controllers.hand.numberOfPlayersWithCards() !== controllers.names.get().length) {
            controllers.state.set(GameStates.END_WAR);
        } else {
            controllers.state.set(GameStates.START_FLIP);
        }
    }

    endBattle(controllers: Controllers) {
        const flipped = controllers.war.getLastFlipped();
        for(let i = 0; i < flipped.length; i++) {
            controllers.players.messageAll(new FlippedMessage(controllers.names.get(i), flipped[i]));
            // TODO move these kinds of messages into controllers
        }
        
        const max = controllers.war.battleWinner();
        
        if(max === -1) {
            controllers.state.set(GameStates.START_WAR);
            return;
        }
        controllers.war.givePlayedTo(max);

        controllers.players.messageAll(new WonBattleMessage(controllers.names.get()[max]));
        controllers.players.messageAll(new SpacingMessage());

        if(controllers.hand.numberOfPlayersWithCards() === 1) {
            controllers.state.set(GameStates.END_GAME);
        } else {
            controllers.state.set(GameStates.START_BATTLE);
        }
    }

    startWar(controllers: Controllers) {
        controllers.state.set(GameStates.START_FLIP);
    }

    endWar(controllers: Controllers) {
        const flipped = controllers.war.getLastFlipped();
        for(let i = 0; i < flipped.length; i++) {
            controllers.players.messageAll(new FlippedMessage(controllers.names.get(i), flipped[i]));
        }

        const max = controllers.war.battleWinner();
        
        if(max === -1) {
            controllers.state.set(GameStates.START_WAR);
            return;
        }
        controllers.war.givePlayedTo(max);
        
        controllers.players.messageAll(new WonWarMessage(controllers.names.get(max)));
        controllers.players.messageAll(new SpacingMessage());

        if(controllers.hand.numberOfPlayersWithCards() === 1) {
            controllers.state.set(GameStates.END_GAME);
        } else {
            controllers.state.set(GameStates.START_BATTLE);
        }
    }

    endGame(controllers: Controllers) {
        if(controllers.hand.numberOfPlayersWithCards() > 1) {
            controllers.players.messageAll(new StalemateMessage());
        } else {
            controllers.players.messageAll(new GameOverMessage(controllers.names.get(controllers.hand.handWithMostCards())));
        }
        controllers.completed.complete();
    }
}
