import { GameState } from "./game-state";
import { GameParams } from "./game-params";
import { HandlerData } from "./handler-data";
import { GameHandlerParams } from "./game-handler";
import { GenericGameStateTransitions, Deck, Rank, SpacingMessage } from '@cards-ts/core';
import { DealOutMessage, LeadsMessage, PlayedMessage, EndRoundMessage, DealerMessage, OrderUpMessage, PassMessage, NameTrumpMessage, TrumpMessage, WonTrickMessage, WonRoundMessage, GoingAloneMessage } from "./messages/status";
import { ResponseMessage } from "./messages/response-message";
import { StateTransformer } from "./state-transformer";
import { HandlerProxy as GenericHandlerProxy } from "@cards-ts/core/lib/games/handler-proxy";
import { SystemHandlerParams } from "@cards-ts/core/lib/handlers/system-handler";
import { getTeamFor, getTeams } from "./util/teams";
import { winningPlay } from "./util/winning-play";
import { TurnUpMessage } from "./messages/status/turn-up-message";

type HandlerProxy = GenericHandlerProxy<HandlerData, ResponseMessage, GameHandlerParams & SystemHandlerParams, GameParams, GameState.State, GameState, StateTransformer>;

export class GameStateTransitions implements GenericGameStateTransitions<HandlerData, ResponseMessage, GameHandlerParams & SystemHandlerParams, GameParams, GameState.State, GameState, StateTransformer> {
    public get() {
        return {
            [GameState.State.START_GAME]: this.startGame,
            [GameState.State.START_ROUND]: this.startRound,
            [GameState.State.START_ORDERING_UP]: this.startOrderingUp,
            [GameState.State.WAIT_FOR_ORDER_UP]: this.waitForOrderUp,
            [GameState.State.HANDLE_ORDER_UP]: this.handleOrderUp,
            [GameState.State.WAIT_FOR_DEALER_DISCARD]: this.waitForDealerDiscard,
            [GameState.State.HANDLE_DEALER_DISCARD]: this.handleDealerDiscard,
            [GameState.State.START_TRUMP_NAMING]: this.startTrumpNaming,
            [GameState.State.WAIT_FOR_TRUMP_NAMING]: this.waitForTrumpNaming,
            [GameState.State.HANDLE_TRUMP_NAMING]: this.handleTrumpNaming,
            [GameState.State.START_TRICK]: this.startTrick,
            [GameState.State.START_PLAY]: this.startPlay,
            [GameState.State.WAIT_FOR_PLAY]: this.waitForPlay,
            [GameState.State.HANDLE_PLAY]: this.handlePlay,
            [GameState.State.END_PLAY]: this.endPlay,
            [GameState.State.END_TRICK]: this.endTrick,
            [GameState.State.END_ROUND]: this.endRound,
            [GameState.State.END_GAME]: this.endGame,
        }
    }

    startGame(gameState: GameState) {
        gameState.state = GameState.State.START_ROUND;
    }

    startRound(gameState: GameState, handlerProxy: HandlerProxy) {
        gameState.deck = new Deck(1, true, false, Rank.ranks.slice(Rank.ranks.indexOf(Rank.NINE)));
        
        handlerProxy.messageAll(gameState, new DealerMessage(gameState.names[gameState.dealer]));

        for(let i = 0; i < 5; i++) { // TODO take from params?
            for(let j = 0; j < gameState.numPlayers; j++) {
                const drawn = gameState.deck.draw();
                const player = (j + gameState.dealer) % gameState.numPlayers;
                gameState.hands[player].push(drawn);
            }
        }
        for(let player = 0; player < gameState.numPlayers; player++) {
            handlerProxy.message(gameState, player, new DealOutMessage(gameState.hands[player]));
        }

        gameState.flippedCard = gameState.deck.flip();
        gameState.currentTrump = gameState.flippedCard.suit;

        gameState.tricksTaken = new Array(gameState.numPlayers).fill(0);

        gameState.leader = (gameState.dealer + 1) % gameState.numPlayers; // TODO make shared utility function
        while(!isPlayingThisRound(gameState.leader, gameState)) {
            gameState.leader = (gameState.leader + 1) % gameState.numPlayers; // TODO make shared utility function
        }

        gameState.state = GameState.State.START_ORDERING_UP;
    }

    startOrderingUp(gameState: GameState, handlerProxy: HandlerProxy) {
        handlerProxy.messageAll(gameState, new TurnUpMessage(gameState.flippedCard));

        gameState.state = GameState.State.WAIT_FOR_ORDER_UP;
        gameState.whoseTurn = gameState.leader;
    }

    waitForOrderUp(gameState: GameState, handlerProxy: HandlerProxy) {
        handlerProxy.handlerCall(gameState, gameState.whoseTurn, 'orderUp');
        
        gameState.state = GameState.State.HANDLE_ORDER_UP;
    }

    handleOrderUp(gameState: GameState, handlerProxy: HandlerProxy) {
        if(gameState.bidder !== undefined) {
            handlerProxy.messageAll(gameState, new OrderUpMessage(gameState.names[gameState.whoseTurn]));
            if(gameState.goingAlone !== undefined) {
                handlerProxy.messageAll(gameState, new GoingAloneMessage(gameState.names[gameState.whoseTurn]));
            }
            handlerProxy.messageAll(gameState, new TrumpMessage(gameState.currentTrump));
            gameState.leader = (gameState.dealer + 1) % gameState.numPlayers;
            gameState.state = GameState.State.WAIT_FOR_DEALER_DISCARD;
        } else {
            handlerProxy.messageAll(gameState, new PassMessage(gameState.names[gameState.whoseTurn]));
            if(gameState.whoseTurn === gameState.dealer) {
                gameState.state = GameState.State.START_TRUMP_NAMING;
            } else {
                gameState.whoseTurn = (gameState.whoseTurn + 1) % gameState.numPlayers;
                gameState.state = GameState.State.WAIT_FOR_ORDER_UP;
            }
        }
    }

    waitForDealerDiscard(gameState: GameState, handlerProxy: HandlerProxy) {
        handlerProxy.handlerCall(gameState, gameState.dealer, 'dealerDiscard');
        
        gameState.state = GameState.State.HANDLE_DEALER_DISCARD;
    }

    handleDealerDiscard(gameState: GameState, handlerProxy: HandlerProxy) {
        gameState.hands[gameState.dealer].push(gameState.flippedCard);

        gameState.state = GameState.State.START_TRICK;
    }

    startTrumpNaming(gameState: GameState, handlerProxy: HandlerProxy) {
        gameState.state = GameState.State.WAIT_FOR_TRUMP_NAMING;
        gameState.whoseTurn = gameState.leader;
    }

    waitForTrumpNaming(gameState: GameState, handlerProxy: HandlerProxy) {
        handlerProxy.handlerCall(gameState, gameState.whoseTurn, 'nameTrump');
        
        gameState.state = GameState.State.HANDLE_TRUMP_NAMING;
    }

    handleTrumpNaming(gameState: GameState, handlerProxy: HandlerProxy) {
        if(gameState.bidder !== undefined) {
            handlerProxy.messageAll(gameState, new NameTrumpMessage(gameState.names[gameState.whoseTurn], gameState.currentTrump));
            if(gameState.goingAlone !== undefined) {
                handlerProxy.messageAll(gameState, new GoingAloneMessage(gameState.names[gameState.whoseTurn]));
            }
            gameState.leader = (gameState.dealer + 1) % gameState.numPlayers;
            gameState.state = GameState.State.START_TRICK;
        } else {
            handlerProxy.messageAll(gameState, new PassMessage(gameState.names[gameState.whoseTurn]));
            if(gameState.whoseTurn === gameState.dealer) {
                // this depends e.g. misdeal
                gameState.state = GameState.State.START_ROUND;
            } else {
                gameState.whoseTurn = (gameState.whoseTurn + 1) % gameState.numPlayers;
                gameState.state = GameState.State.WAIT_FOR_TRUMP_NAMING;
            }
        }
    }

    startTrick(gameState: GameState, handlerProxy: HandlerProxy) {
        handlerProxy.messageAll(gameState, new SpacingMessage());
        handlerProxy.messageAll(gameState, new LeadsMessage(gameState.names[gameState.leader]));
        gameState.currentTrick = [];
        gameState.whoseTurn = gameState.leader;

        gameState.state = GameState.State.START_PLAY;
    }

    startPlay(gameState: GameState) {
        if(isPlayingThisRound(gameState.whoseTurn, gameState)) {
            gameState.state = GameState.State.WAIT_FOR_PLAY;
        } else {
            gameState.currentTrick.push(undefined);
            gameState.state = GameState.State.END_PLAY;
        }
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

        gameState.state = GameState.State.END_PLAY;
    }

    endPlay(gameState: GameState) {
        if(gameState.currentTrick.length === gameState.numPlayers) {
            gameState.state = GameState.State.END_TRICK;
        } else {
            gameState.whoseTurn = (gameState.whoseTurn + 1) % gameState.numPlayers;
            gameState.state = GameState.State.START_PLAY;
        }
    }

    endTrick(gameState: GameState, handlerProxy: HandlerProxy) {
        gameState.tricks++;

        const winner = (gameState.leader + winningPlay(gameState.currentTrick, gameState.currentTrump)) % gameState.numPlayers;

        handlerProxy.messageAll(gameState, new WonTrickMessage(gameState.names[winner]));
        
        gameState.leader = winner;
        gameState.tricksTaken[getTeamFor(winner, gameState.gameParams)] += 1;

        // if(gameState.gameParams.quickEnd && !gameState.hands.flatMap(hand => hand).map(valueOfCard).some(value => value >= 0)) {
        //     // might be nice to have a message here if round ends early
        //     gameState.state = GameState.State.END_ROUND;
        // } else
         if(gameState.hands.some(hand => hand.length === 0)) {
            gameState.state = GameState.State.END_ROUND;
        } else {
            gameState.state = GameState.State.START_TRICK;
        }
    }

    endRound(gameState: GameState, handlerProxy: HandlerProxy) {
        const bidderTeam = getTeamFor(gameState.bidder as number, gameState.gameParams);
        const teams = getTeams(gameState.gameParams);
        const numberOfTeams = teams.length;

        let winner = 0;

        for(let i = 1; i < numberOfTeams; i++) {
            if(gameState.tricksTaken[i] > gameState.tricksTaken[winner]) {
                winner = i;
            }
        }

        let points = calculatePoints(bidderTeam, winner, gameState);
        // TODO rework this to group players
        for(let teammate of teams[winner]) {
            gameState.points[teammate] += points;
        }
        handlerProxy.messageAll(gameState, new WonRoundMessage(teams[winner].map(i => gameState.names[i]), points));
        
        handlerProxy.messageAll(gameState, new EndRoundMessage(gameState.names, gameState.points));
        handlerProxy.messageAll(gameState, new SpacingMessage());
        
        if(gameState.points.some(points => points >= gameState.gameParams.maxScore)) {
            gameState.state = GameState.State.END_GAME;
        } else {
            gameState.state = GameState.State.START_ROUND;

            gameState.dealer = (gameState.dealer + 1) % gameState.numPlayers;
        }

        gameState.tricks = 0;
        gameState.bidder = undefined;
        gameState.goingAlone = undefined;
    }

    endGame(gameState: GameState) {
        gameState.completed = true;
    }

}

function calculatePoints(bidderTeam: number, winnerTeam: number, gameState: GameState) {
    if (bidderTeam == winnerTeam) {
        if (gameState.tricksTaken[winnerTeam] === 5) {
            if(gameState.goingAlone) {
                return 4;
            }
            return 2;
        }
        return 1;
    } else {
        return 2;
        // 'euchred'
    }
}

function isPlayingThisRound(position: number, gameState: GameState) {
    if(gameState.goingAlone === undefined) {
        return true;
    }
    if(position === gameState.goingAlone) {
        return true;
    }
    if(getTeamFor(position, gameState.gameParams) !== getTeamFor(gameState.goingAlone, gameState.gameParams)) {
        return true;
    }
    return false;
}
