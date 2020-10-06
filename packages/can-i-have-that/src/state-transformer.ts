import { AbstractStateTransformer, Card, Deck, distinct, Meld, runFromObj } from "@cards-ts/core";
import { GameParams } from "./game-params";
import { GameState } from "./game-state";
import { HandlerData } from "./handler-data";
import { ResponseMessage } from "./messages/response-message";

export class StateTransformer extends AbstractStateTransformer<GameParams, GameState.State, HandlerData, GameState, ResponseMessage> {
    transformToHandlerData(gameState: GameState, position: number): HandlerData {
        // TODO is cloneDeep needed and should deepFreeze be used
        return {
            gameParams: GameParams.fromObj(gameState.gameParams),
            dealer: gameState.dealer,
            hand: gameState.hands[position].map(card => Card.fromObj(card)),
            numPlayers: gameState.numPlayers,
            played: gameState.played.map(runs => runs.map(run => runFromObj(run))),
            position,
            round: gameState.round,
            points: gameState.points.slice(),
            deckCard: gameState.deck.top as Card,
            wouldBeTurn: gameState.whoseAsk === gameState.whoseTurn,
            data: gameState.data[position]
        };
    }

    merge(gameState: GameState, sourceHandler: number, incomingEvent: ResponseMessage): GameState {
        switch(incomingEvent.type) {
            case 'want-card-response': {
                const newState: GameState = {
                    ...gameState,
                    wantCard: incomingEvent.wantCard,
                    data: [...gameState.data.slice(0, sourceHandler), incomingEvent.data, ...gameState.data.slice(sourceHandler + 1)]
                };
                if(!Array.isArray(gameState.waiting)) {
                    throw new Error('waiting is not an array, got: ' + gameState.waiting);
                }
                gameState.waiting.splice(gameState.waiting.indexOf(sourceHandler), 1);
                return newState;
            }
            case 'discard-response': {
                const newHand = gameState.hands[gameState.whoseTurn];
                const index = newHand.findIndex(incomingEvent.toDiscard.equals.bind(incomingEvent.toDiscard));
                if(index === -1) {
                    throw new Error('Player did not have card ' + incomingEvent.toDiscard);
                }
                const newState: GameState = {
                    ...gameState,
                    toDiscard: incomingEvent.toDiscard,
                    data: [...gameState.data.slice(0, sourceHandler), incomingEvent.data, ...gameState.data.slice(sourceHandler + 1)]
                };
                newState.hands[gameState.whoseTurn] = newHand;
                if(!Array.isArray(gameState.waiting)) {
                    throw new Error('waiting is not an array, got: ' + gameState.waiting);
                }
                gameState.waiting.splice(gameState.waiting.indexOf(sourceHandler), 1);
                return newState;
            }
            case 'go-down-response': {
                // TODO full logic
                // TODO what lives here vs in the handleTurn function?
                const toPlay = incomingEvent.toPlay.flatMap(meld => meld.cards).filter(distinct);
                const newHand = gameState.hands[gameState.whoseTurn].slice();
                for(const card of toPlay) {
                    const index = newHand.findIndex(card.equals.bind(card));
                    if(index === -1) {
                        throw new Error('Player did not have card ' + card);
                    }
                    newHand.splice(index, 1);
                }
                const newState: GameState = {
                    ...gameState,
                    toGoDown: incomingEvent.toPlay,
                    data: [...gameState.data.slice(0, sourceHandler), incomingEvent.data, ...gameState.data.slice(sourceHandler + 1)]
                };
                
                newState.hands[gameState.whoseTurn] = newHand;
                
                if(newState.hands[gameState.whoseTurn].length === 0){
                    if(!Array.isArray(gameState.waiting)) {
                        throw new Error('waiting is not an array, got: ' + gameState.waiting);
                    }
                    gameState.waiting.splice(gameState.waiting.indexOf(sourceHandler), 1);
                }
                return newState;
            }
            case 'play-response': {
                const toPlay = incomingEvent.toPlay.filter(distinct);
                const newHand = gameState.hands[gameState.whoseTurn].slice();
                for(const card of toPlay) {
                    const index = newHand.findIndex(card.equals.bind(card));
                    if(index === -1) {
                        throw new Error('Player did not have card ' + card);
                    }
                    newHand.splice(index, 1);
                }
                let player = 0;
                let meld = 0;
                let found = false;
                for(; player < gameState.numPlayers; player++) {
                    for(; meld < gameState.played[player].length; meld++) {
                        // TODO could there be multiple equivalent
                        if(gameState.played[player][meld].equals(incomingEvent.playOn)) {
                            found = true;
                            break;
                        }
                    }
                }
                if(!found) {
                    throw new Error('Could not find played-on meld');
                }
                const newState: GameState = {
                    ...gameState,
                    data: [...gameState.data.slice(0, sourceHandler), incomingEvent.data, ...gameState.data.slice(sourceHandler + 1)]
                };
                newState.hands[gameState.whoseTurn] = newHand;
                newState.toPlayOnOthers[player] = newState.toPlayOnOthers[player] || [];
                newState.toPlayOnOthers[player][meld] = newState.toPlayOnOthers[player][meld] || [];
                newState.toPlayOnOthers[player][meld].push(...toPlay);

                if(newState.hands[gameState.whoseTurn].length === 0){
                    if(!Array.isArray(gameState.waiting)) {
                        throw new Error('waiting is not an array, got: ' + gameState.waiting);
                    }
                    gameState.waiting.splice(gameState.waiting.indexOf(sourceHandler), 1);
                }
                return newState;
            }
            case 'data-response': {
                const newState: GameState = {
                    ...gameState,
                    data: [...gameState.data.slice(0, sourceHandler), incomingEvent.data, ...gameState.data.slice(sourceHandler + 1)]
                };
                return newState;
            }
        }
    }

    toString(state: GameState) {
        return JSON.stringify(state);
    }

    fromStr(str: string) {
        const obj = JSON.parse(str);

        // TODO better shape checking
        if(typeof obj !== 'object' || !obj) {
            throw new Error('Not an object');
        }
        if(!Array.isArray(obj.data) || !Array.isArray(obj.hands) || !Array.isArray(obj.names) || !Array.isArray(obj.played) || !Array.isArray(obj.points)) {
            throw new Error('Shape of object is wrong');
        }
        const gameState: GameState = {
            ...obj,
            deck: Deck.fromObj(obj.deck),
            hands: obj.hands.map((hand: Card[]) => hand.map(card => Card.fromObj(card))),
            played: obj.played.map((runs: Meld[]) => runs.map(run => runFromObj(run))),
        };
        return gameState;
    }

    initialState({ names, gameParams }: { names: string[], gameParams: GameParams }) {
        const state = super.initialState({ names, gameParams, initialState: GameState.State.START_GAME });
        
        state.points = new Array(names.length).fill(0, 0, names.length);
        state.dealer = 0;
        state.whoseTurn = 0;
        state.round = 0;

        return state;
    }
}