import { GameState } from "./game-state";
import { GameParams } from "./game-params";
import { HandlerData } from "./handler-data";
import { GameHandler, GameHandlerParams } from "./game-handler";
import { GenericGameStateIterator, Card, Deck, SystemHandlerParams } from '@cards-ts/core';
import { ResponseMessage } from "./messages/response-message";
import { StateTransformer } from "./state-transformer";
import { HandlerProxy as GenericHandlerProxy } from "@cards-ts/core/lib/games/handler-proxy";
import { FlippedMessage, GameOverMessage, StalemateMessage, WonBattleMessage, WonWarMessage } from "./messages/status";

type HandlerProxy = GenericHandlerProxy<HandlerData, ResponseMessage, SystemHandlerParams & GameHandlerParams, GameParams, GameState.State, GameState, StateTransformer>;

export class GameStateIterator implements GenericGameStateIterator<HandlerData, ResponseMessage, SystemHandlerParams & GameHandlerParams, GameParams, GameState.State, GameState, StateTransformer> {
    private dealOut(gameState: GameState) {
        gameState.deck.shuffle();
        while(gameState.deck.cards.length) {
            for (let player = 0; player < gameState.numPlayers; player++) {
                gameState.hands[player].push(gameState.deck.draw());
            }
        }
    }

    public iterate(gameState: GameState, handlerProxy: HandlerProxy): void {
        switch(gameState.state) {
            case GameState.State.START_GAME:
                this.startGame(gameState);
                break;

            case GameState.State.START_BATTLE:
                this.startBattle(gameState, handlerProxy);
                break;

                
            case GameState.State.START_FLIP:
                this.startFlip(gameState, handlerProxy);
                break;

            case GameState.State.WAIT_FOR_FLIP:
                this.waitForFlip(gameState, handlerProxy);
                break;

            case GameState.State.HANDLE_FLIP:
                this.handleFlip(gameState, handlerProxy);
                break;

            case GameState.State.END_BATTLE:
                this.endBattle(gameState, handlerProxy);
                break;

            case GameState.State.START_WAR:
                this.startWar(gameState, handlerProxy);
                break;

            case GameState.State.END_WAR:
                this.endWar(gameState, handlerProxy);
                break;

            case GameState.State.END_GAME:
                this.endGame(gameState, handlerProxy);
                break;
        }
    }

    startGame(gameState: GameState) {
        gameState.deck = new Deck(1, true, false);
        this.dealOut(gameState);

        gameState.state = GameState.State.START_BATTLE;
    }

    startBattle(gameState: GameState, handlerProxy: HandlerProxy) {
        gameState.playedCards = gameState.names.map(() => []);

        gameState.state = GameState.State.START_FLIP;
        
        if(gameState.battleCount++ > gameState.gameParams.maxBattles) {
            gameState.state = GameState.State.END_GAME;
        }
    }

    startFlip(gameState: GameState, handlerProxy: HandlerProxy) {
        gameState.state = GameState.State.WAIT_FOR_FLIP;
    }

    waitForFlip(gameState: GameState, handlerProxy: HandlerProxy) {
        handlerProxy.handlerCallAll(gameState, 'flip');
        
        gameState.state = GameState.State.HANDLE_FLIP;
    }

    handleFlip(gameState: GameState, handlerProxy: HandlerProxy) {
        for(let i = 0; i < gameState.hands.length; i++) {
            let [flipped] = gameState.hands[i].splice(0, 1);
            gameState.playedCards[i].push(flipped);
        }

        if(gameState.playedCards.every(cards => cards.length == 1)) {
            gameState.state = GameState.State.END_BATTLE;
        } else if (gameState.playedCards.every(cards => (cards.length - 1) % 4 == 0) || gameState.hands.some(hand => hand.length == 0)) {
            gameState.state = GameState.State.END_WAR;
        } else {
            gameState.state = GameState.State.START_FLIP;
        }
    }

    endBattle(gameState: GameState, handlerProxy: HandlerProxy) {
        for(let i = 0; i < gameState.hands.length; i++) {
            let flipped = gameState.playedCards[i][gameState.playedCards[i].length - 1];
            handlerProxy.messageAll(gameState, new FlippedMessage(gameState.names[i], flipped));
        }

        const compared = gameState.playedCards.map(cards => cards[cards.length - 1].rank);
        let max = 0;
        for(let i = 1; i < compared.length; i++) {
            if(compared[i].difference(compared[max]) <= 0) {
                max = i;
            }
        }
        if(compared.findIndex(rank => rank == compared[max]) != max) {
            gameState.state = GameState.State.START_WAR;
            return;
        }
        gameState.hands[max].push(...gameState.playedCards.flat());

        handlerProxy.messageAll(gameState, new WonBattleMessage(gameState.names[max]));

        if(gameState.hands.filter(hand => hand.length != 0).length == 1) {
            gameState.state = GameState.State.END_GAME;
        } else {
            gameState.state = GameState.State.START_BATTLE;
        }
    }

    startWar(gameState: GameState, handlerProxy: HandlerProxy) {
        gameState.state = GameState.State.START_FLIP;
    }

    endWar(gameState: GameState, handlerProxy: HandlerProxy) {
        for(let i = 0; i < gameState.hands.length; i++) {
            let flipped = gameState.playedCards[i][gameState.playedCards[i].length - 1];
            handlerProxy.messageAll(gameState, new FlippedMessage(gameState.names[i], flipped));
        }

        const compared = gameState.playedCards.map(cards => cards[cards.length - 1].rank);
        let max = 0;
        for(let i = 1; i < compared.length; i++) {
            if(compared[i].difference(compared[max]) <= 0) {
                max = i;
            }
        }
        if(compared.findIndex(rank => rank == compared[max]) != max) {
            gameState.state = GameState.State.START_WAR;
            return;
        }
        gameState.hands[max].push(...gameState.playedCards.flat());
        
        handlerProxy.messageAll(gameState, new WonWarMessage(gameState.names[max]));

        if(gameState.hands.filter(hand => hand.length != 0).length == 1) {
            gameState.state = GameState.State.END_GAME;
        } else {
            gameState.state = GameState.State.START_BATTLE;
        }
    }

    endGame(gameState: GameState, handlerProxy: HandlerProxy) {
        const maxSize = Math.max(...gameState.hands.map(hand => hand.length));
        if (gameState.hands.filter(hand => hand.length == maxSize).length > 1) {
            handlerProxy.messageAll(gameState, new StalemateMessage())
        } else {
            handlerProxy.messageAll(gameState, new GameOverMessage(gameState.names[gameState.hands.findIndex(hand => hand.length == maxSize)]));
        }
        gameState.completed = true;
    }

}