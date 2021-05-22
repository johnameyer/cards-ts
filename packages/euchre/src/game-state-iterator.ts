import { GameState } from "./game-state";
import { GameParams } from "./game-params";
import { HandlerData } from "./handler-data";
import { GameHandler, GameHandlerParams } from "./game-handler";
import { GenericGameStateIterator, Card, Deck, Rank, Suit, SystemHandler, SpacingMessage } from '@cards-ts/core';
import { DealOutMessage, NoPassingMessage, PassingMessage, PassedMessage, LeadsMessage, PlayedMessage, ShotTheMoonMessage, ScoredMessage, EndRoundMessage } from "./messages/status";
import { ResponseMessage } from "./messages/response-message";
import { StateTransformer } from "./state-transformer";
import { HandlerProxy as GenericHandlerProxy } from "@cards-ts/core/lib/games/handler-proxy";
import { SystemHandlerParams } from "@cards-ts/core/lib/handlers/system-handler";

function valueOfCard(card: Card): number {
    if(card.equals(Card.fromString('QS'))) {
        return 13; // NUM OF HEARTS
    }
    if(card.suit === Suit.HEARTS) {
        return 1;
    }
    return 0;
}

type HandlerProxy = GenericHandlerProxy<HandlerData, ResponseMessage, GameHandlerParams & SystemHandlerParams, GameParams, GameState.State, GameState, StateTransformer>;

export class GameStateIterator implements GenericGameStateIterator<HandlerData, ResponseMessage, GameHandlerParams & SystemHandlerParams, GameParams, GameState.State, GameState, StateTransformer> {
    public iterate(gameState: GameState, handlerProxy: HandlerProxy): void {
        switch(gameState.state) {
            case GameState.State.START_GAME:
                this.startGame(gameState);
                break;

            case GameState.State.START_ROUND:
                this.startRound(gameState, handlerProxy);
                break;

                
            case GameState.State.START_PASS:
                this.startPass(gameState, handlerProxy);
                break;

            case GameState.State.WAIT_FOR_PASS:
                this.waitForPass(gameState, handlerProxy);
                break;

            case GameState.State.HANDLE_PASS:
                this.handlePass(gameState, handlerProxy);
                break;

            case GameState.State.START_FIRST_TRICK:
                this.startFirstTrick(gameState, handlerProxy);
                break;

            case GameState.State.START_TRICK:
                this.startTrick(gameState, handlerProxy);
                break;

            case GameState.State.START_PLAY:
                this.startPlay(gameState);
                break;

            case GameState.State.WAIT_FOR_PLAY:
                this.waitForPlay(gameState, handlerProxy);
                return;

            case GameState.State.HANDLE_PLAY:
                this.handlePlay(gameState, handlerProxy);
                break;

            case GameState.State.END_TRICK:
                this.endTrick(gameState);
                break;

            case GameState.State.END_ROUND:
                this.endRound(gameState, handlerProxy);
                break;

            case GameState.State.END_GAME:
                this.endGame(gameState);
                break;
        }
    }

    startGame(gameState: GameState) {
        gameState.pass = 1;

        gameState.state = GameState.State.START_ROUND;
    }

    startRound(gameState: GameState, handlerProxy: HandlerProxy) {
        gameState.deck = new Deck(1, true, false);

        while(gameState.deck.cards.length) {
            for(let i = 0; i < gameState.numPlayers; i++) {
                const drawn = gameState.deck.draw();
                const player = (i + gameState.dealer) % gameState.numPlayers;
                gameState.hands[player].push(drawn);
            }
        }
        for(let player = 0; player < gameState.numPlayers; player++) {
            handlerProxy.message(gameState, player, new DealOutMessage(gameState.hands[player]));
        }

        gameState.pointsTaken = new Array(gameState.numPlayers).fill(0);

        if(gameState.pass === 0) {
            gameState.state = GameState.State.START_FIRST_TRICK;
            handlerProxy.messageAll(gameState, new NoPassingMessage());
        } else {
            gameState.state = GameState.State.START_PASS;
        }
    }

    startPass(gameState: GameState, handlerProxy: HandlerProxy) {
        handlerProxy.messageAll(gameState, new PassingMessage(gameState.gameParams.numToPass, gameState.pass, gameState.numPlayers));

        gameState.state = GameState.State.WAIT_FOR_PASS;
        gameState.passed = new Array(gameState.numPlayers).fill(undefined);
    }

    waitForPass(gameState: GameState, handlerProxy: HandlerProxy) {
        handlerProxy.handlerCallAll(gameState, 'pass');
        
        gameState.state = GameState.State.HANDLE_PASS;
    }

    handlePass(gameState: GameState, handlerProxy: HandlerProxy) {
        for(let player = 0; player < gameState.numPlayers; player++) {
            const passedFrom = (player + gameState.pass + gameState.numPlayers) % gameState.numPlayers; // TODO consider +- here
            const passed = gameState.passed[passedFrom];
            gameState.hands[passedFrom] = gameState.hands[passedFrom].filter(card => !passed.some(other => other.equals(card)));
            handlerProxy.message(gameState, player, new PassedMessage(passed, gameState.names[passedFrom]));
            gameState.hands[player].push(...passed);
        }

        gameState.leader = (gameState.dealer + 1) % gameState.numPlayers;
        gameState.state = GameState.State.START_FIRST_TRICK;
    }

    startFirstTrick(gameState: GameState, handlerProxy: HandlerProxy) {
        const startingCard = new Card(Suit.CLUBS, Rank.TWO);
        gameState.leader = gameState.hands.findIndex(hand => hand.find(card => card.equals(startingCard)) !== undefined);
        
        handlerProxy.messageAll(gameState, new SpacingMessage());
        handlerProxy.messageAll(gameState, new LeadsMessage(gameState.names[gameState.leader]));

        const [removed] = gameState.hands[gameState.leader].splice(gameState.hands[gameState.leader].findIndex(card => card.equals(startingCard)), 1);
        gameState.currentTrick = [removed];
        handlerProxy.messageOthers(gameState, gameState.leader, new PlayedMessage(gameState.names[gameState.leader], removed))

        gameState.whoseTurn = (gameState.leader + 1) % gameState.numPlayers;

        gameState.state = GameState.State.START_PLAY;
    }

    startTrick(gameState: GameState, handlerProxy: HandlerProxy) {
        handlerProxy.messageAll(gameState, new SpacingMessage());
        handlerProxy.messageAll(gameState, new LeadsMessage(gameState.names[gameState.leader]));
        gameState.currentTrick = [];
        gameState.whoseTurn = gameState.leader;

        gameState.state = GameState.State.START_PLAY;
    }

    startPlay(gameState: GameState) {
        gameState.state = GameState.State.WAIT_FOR_PLAY;
    }

    waitForPlay(gameState: GameState, handlerProxy: HandlerProxy) {
        handlerProxy.handlerCall(gameState, gameState.whoseTurn, 'turn');
        
        gameState.state = GameState.State.HANDLE_PLAY;
    }

    handlePlay(gameState: GameState, handlerProxy: HandlerProxy) {
        const { whoseTurn, playedCard, hands} = gameState;
        gameState.currentTrick.push(playedCard);
        const index = hands[whoseTurn].findIndex(card => card.equals(playedCard));
        if(index == -1) {
            throw new Error('Nonexistent card?');
        }
        hands[whoseTurn].splice(index, 1);
        handlerProxy.messageOthers(gameState, whoseTurn, new PlayedMessage(gameState.names[whoseTurn], playedCard))

        if(gameState.currentTrick.length === gameState.numPlayers) {
            gameState.state = GameState.State.END_TRICK;
        } else {
            gameState.whoseTurn = (whoseTurn + 1) % gameState.numPlayers;
            gameState.state = GameState.State.START_PLAY;
        }
    }

    endTrick(gameState: GameState) {
        gameState.tricks++;

        const leadingSuit = gameState.currentTrick[0].suit;
        let winningPlayer = 0;
        for(let i = 1; i < gameState.numPlayers; i++) {
            const card = gameState.currentTrick[i];
            if(card.suit === leadingSuit) {
                if(card.rank.order > gameState.currentTrick[winningPlayer].rank.order) {
                    winningPlayer = i;
                }
            }
        }

        gameState.pointsTaken[(winningPlayer + gameState.leader) % gameState.numPlayers] += gameState.currentTrick.map(valueOfCard).reduce((a, b) => a + b, 0);
        gameState.leader = (winningPlayer + gameState.leader) % gameState.numPlayers;

        if(gameState.gameParams.quickEnd && !gameState.hands.flatMap(hand => hand).map(valueOfCard).some(value => value >= 0)) {
            // might be nice to have a message here if round ends early
            gameState.state = GameState.State.END_ROUND;
        } else if(gameState.hands.every(hand => hand.length === 0)) {
            gameState.state = GameState.State.END_ROUND;
        } else {
            gameState.state = GameState.State.START_TRICK;
        }
    }

    endRound(gameState: GameState, handlerProxy: HandlerProxy) {
        gameState.tricks = 0;

        for(let player = 0; player < gameState.numPlayers; player++) {
            const newPoints = gameState.pointsTaken[player];

            if(newPoints === 26) { // MAX POINTS, not set upfront but by the number of cards in the deck
                for(let otherPlayer = 0; otherPlayer < gameState.numPlayers; otherPlayer++) {
                    if(otherPlayer !== player) {
                        gameState.points[otherPlayer] += newPoints;
                    }
                }
                handlerProxy.messageAll(gameState, new ShotTheMoonMessage(gameState.names[player]));
            } else {
                gameState.points[player] += newPoints;
                handlerProxy.message(gameState, player, new ScoredMessage(newPoints));
            }
        }
        
        handlerProxy.messageAll(gameState, new EndRoundMessage(gameState.names, gameState.points));

        if(gameState.pass === gameState.numPlayers / 2) { // handles even number going from across to keep
            gameState.pass = 0;
        } else if(gameState.pass > 0){ // 1 to the right goes to 1 to the left
            gameState.pass = -gameState.pass;
        } else { // 1 to the left goes to 2 to the right
            gameState.pass = -gameState.pass + 1;
        }

        if(gameState.pass > gameState.numPlayers / 2) { // 2 to the left in 5 person game goes to keep
            gameState.pass = 0;
        }
        
        if(gameState.points.some(points => points >= gameState.gameParams.maxScore)) {
            gameState.state = GameState.State.END_GAME;
        } else {
            gameState.state = GameState.State.START_ROUND;
        }   
    }

    endGame(gameState: GameState) {
        gameState.completed = true;
    }

}