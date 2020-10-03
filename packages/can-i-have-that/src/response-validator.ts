import { GenericResponseValidator, Card, InvalidError, Meld, zip } from "@cards-ts/core";
import { checkRun } from "@cards-ts/core/lib/cards/run-util";
import { GameParams } from "./game-params";
import { GameState } from "./game-state";
import { TurnResponseMessage, WantCardResponseMessage, DataResponseMessage } from "./messages/response";
import { ResponseMessage } from "./messages/response-message";

const mapToClone = <T extends {clone: () => T}>(arr: T[]) => arr.map((t: T) => t.clone());

function checkExistenceAndRemove<T extends {equals: (t: T) => boolean}>(tarr: T[], t: T, errorMessage: string = 'Could not find card') {
    const tIndex = tarr.findIndex((ti) => t.equals(ti));
    if (tIndex === -1) {
        throw new Error(errorMessage + ' ' + t.toString() + ' in ' + tarr.toString());
    }
    tarr.splice(tIndex, 1);
}


/**
 * Checks whether moves made by the handler are legal
 * @param toDiscard the card the handler is attempting to discard
 * @param toPlay the cards on the table after the handler is finished making its turn
 * @param gameState the game state as it was
 */
function checkTurn(
    sourceHandler: number,
    toDiscard: Card | null,
    toPlay: Meld[][],
    gameState: GameState,
) {
   const runningHand: Card[] = gameState.hands[sourceHandler].slice();

   if (toPlay[sourceHandler].length) {
       for (const [run, type] of zip(toPlay[sourceHandler], GameState.Helper.getRound(gameState))) {
           if(run.runType !== type) {
               throw new InvalidError('Run is of the wrong type');
           }
           checkRun(run);
       }
       // figure out cards now played that were not played before
       const changedCards = [];

       for(let player = 0; player < gameState.numPlayers; player++) {
           if(player === sourceHandler || gameState.played[player].length > 0){
               for(let run = 0; run < toPlay[player].length; run++) {
                   const newPlayCards = [...toPlay[player][run].cards];
                   if(gameState.played[player][run]) {
                       for (const card of gameState.played[player][run].cards) {
                           checkExistenceAndRemove(newPlayCards, card);
                       }
                   }
                   changedCards.push(...newPlayCards);
               }
           }
       }
       for (const card of changedCards) {
           checkExistenceAndRemove(runningHand, card);
       }
   }

   if (runningHand.length && toDiscard == null) {
       throw new InvalidError('Must discard');
   }
   if (GameState.Helper.isLastRound(gameState) && toPlay.some(arr => arr.length) && toDiscard !== null) {
       throw new InvalidError('Cannot discard with play on the last round');
   }
   if(toDiscard) {
       for (const plays of toPlay) {
           for(const run of plays) {
               if(run.isLive(toDiscard)) {
                   throw new InvalidError('Card is live ' + toDiscard.toString() + ' on ' + run.toString());
               }
           }
       }
       checkExistenceAndRemove(runningHand, toDiscard);
   }

   return runningHand;
}

export class ResponseValidator implements GenericResponseValidator<GameParams, GameState.State, GameState, ResponseMessage> {
    validate(gameState: GameState, sourceHandler: number, event: ResponseMessage): TurnResponseMessage | WantCardResponseMessage | DataResponseMessage | undefined {
        switch(event.type) {
            case 'turn-card-response': {
                if(sourceHandler !== gameState.whoseTurn) {
                    return undefined;
                }
                try {
                    checkTurn(sourceHandler, event.toDiscard, event.toPlay, gameState);

                    return new TurnResponseMessage(event.toDiscard, event.toPlay, event.data);
                } catch (e) {
                    console.error(e);
                }
                const liveForNone = (card: Card) => !gameState.played.some((runs) => runs.some((play) => play.isLive(card)));
                const possibleDiscard = gameState.hands[sourceHandler].find(liveForNone) || null;

                return new TurnResponseMessage(possibleDiscard, gameState.played);
            }
            case 'want-card-response': {
                if(sourceHandler !== gameState.whoseAsk) {
                    // TODO allow people to say they want card ahead of time
                    return undefined;
                }
                return new WantCardResponseMessage(event.wantCard, event.data);
            }
            case 'data-response': {
                return event;
            }
        }
    }
}