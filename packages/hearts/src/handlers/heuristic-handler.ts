import { Handler } from "../handler";
import { HandlerData } from "../handler-data";
import { Card, combinations, HandlerResponsesQueue } from "@cards-ts/core";
import { Message } from "@cards-ts/core";
import { Suit } from "@cards-ts/core";
import { Rank } from "@cards-ts/core";
import { DataResponseMessage, PassResponseMessage, TurnResponseMessage } from "../messages/response";
import { StatusMessage } from "../messages/status-message";
import { ResponseMessage } from "../messages/response-message";

interface HeuristicHandlerData {
    playerOutOfSuit: {[player: string]: Suit[]},
    numTimesPlayed: {[letter: string]: number}
};

const emptyGrouper = () => {
    const obj: {[letter: string]: Card[]} = {};
    obj[Suit.SPADES.letter] = [];
    obj[Suit.CLUBS.letter] = [];
    obj[Suit.HEARTS.letter] = [];
    obj[Suit.DIAMONDS.letter] = [];
    return obj;
};

const emptyCounter = () => {
    const obj: {[letter: string]: number} = {};
    obj[Suit.SPADES.letter] = 0;
    obj[Suit.CLUBS.letter] = 0;
    obj[Suit.HEARTS.letter] = 0;
    obj[Suit.DIAMONDS.letter] = 0;
    return obj;
};

const QS = new Card(Suit.SPADES, Rank.QUEEN);

function throwAwayRisk(hand: Card[], sorted: {[letter: string]: Card[]}, canBeHeart: boolean, data: HeuristicHandlerData) {
    if(sorted[Suit.SPADES.letter]?.length < 3 - data.numTimesPlayed[Suit.SPADES.letter]) {
        const danger = hand.find(card => card.equals(QS));
        if(danger) {
            return danger;
        }
        // if has AS or KS throw that away
    }

    let throwable = hand;
    if(!canBeHeart) {
        throwable = throwable.filter(card => card.suit !== Suit.HEARTS && !card.equals(QS));
    }
    // throw out high of other suit
    return throwable.sort(Card.compare).reverse()[0];
}

function wrapData(handlerData: HandlerData) {
    // @ts-ignore
    if(!handlerData.data?.playerOutOfSuit) {
        handlerData.data = {
            playerOutOfSuit: {},
            numTimesPlayed: emptyCounter()
        };
    }

    return handlerData.data as HeuristicHandlerData;
}

export class HeuristicHandler extends Handler {
    pass(handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void {
        const data = wrapData(handlerData);
        const { hand, gameParams: { numToPass } } = handlerData;
        const toPass = [];
        const sorted = hand.reduce<{[s: string]: Card[]}>((obj, card) => {
            const suit = card.suit;
            obj[suit.letter].push(card);
            return obj;
        }, emptyGrouper());

        const count = (arr: Suit[]) => arr.map(suit => sorted[suit.letter].length).reduce((a, b) => a + b, 0);
        const throwawaySuits = [Suit.CLUBS, Suit.DIAMONDS, Suit.HEARTS];
        const countSorted = combinations(throwawaySuits).sort((a, b) => count(a) - count(b));
        let i = 0;
        while(count(countSorted[i]) <= numToPass) {
            i++;
        }
        i--;
        const deleteSuit = hand.filter(card => countSorted[i].includes(card.suit));

        toPass.push(...deleteSuit);
        if(toPass.length === numToPass) {
            responsesQueue.push(new PassResponseMessage(toPass, data));
            return;
        }

        const spades = sorted[Suit.SPADES.letter];
        if(spades.length < 4) {
            const QS = new Card(Suit.SPADES, Rank.QUEEN);
            const KS = new Card(Suit.SPADES, Rank.KING);
            const AS = new Card(Suit.SPADES, Rank.ACE);
            const queenIndex = spades.findIndex(card => card.equals(QS));
            const kingIndex = spades.findIndex(card => card.equals(KS));
            const aceIndex = spades.findIndex(card => card.equals(AS));
            const otherSpades = spades.filter(spade => spade.rank.order < Rank.QUEEN.order);
            if(queenIndex >= 0 && otherSpades.length < 3) {
                toPass.push(spades[queenIndex]);
            } else {
                if(kingIndex >= 0) {
                    toPass.push(spades[aceIndex]);
                }
                if(queenIndex >= 0) {
                    toPass.push(spades[aceIndex]);
                }
            }
        }

        if(toPass.length >= numToPass) {
            responsesQueue.push(new PassResponseMessage(toPass.slice(0, numToPass), data));
            return;
        }

        toPass.push(...hand.filter(card => [Suit.CLUBS, Suit.DIAMONDS].includes(card.suit)).sort(Card.compare).reverse());

        responsesQueue.push(new PassResponseMessage(toPass.slice(0, numToPass), data));
        return;
    }

    turn(handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void {
        const data = wrapData(handlerData);
        const { hand, currentTrick, tricks } = handlerData;
        try {
            const sorted = hand.reduce<{[s: string]: Card[]}>((obj, card) => {
                const suit = card.suit;
                obj[suit.letter].push(card);
                return obj;
            }, emptyGrouper());

            if(tricks === 0) {
                // if the first trick
                if(sorted[Suit.CLUBS.letter]?.length) {
                    // throw out our highest club if possible
                    responsesQueue.push(new TurnResponseMessage(sorted[Suit.CLUBS.letter].sort(Card.compare).reverse()[0], data));
                    return;
                } else {
                    responsesQueue.push(new TurnResponseMessage(throwAwayRisk(hand, sorted, false, data), data));
                    return;
                }
            }

            if(currentTrick.length) {
                const follow = currentTrick[0].suit;

                const cardsOfSuit = hand.filter(card => card.suit === follow);

                if(cardsOfSuit.length > 0) {
                    responsesQueue.push(new TurnResponseMessage(cardsOfSuit[0], data));
                    return;
                } else {
                    responsesQueue.push(new TurnResponseMessage(hand.slice().sort(Card.compare).reverse()[0], data));
                    return;
                }
            } else {
                if(sorted[Suit.SPADES.letter]?.length > 3){
                    responsesQueue.push(new TurnResponseMessage(sorted[Suit.SPADES.letter][0], data));
                    return;
                }
                const suitOfLeast = Object.entries(sorted).filter(entry => entry[0] !== Suit.HEARTS.letter).filter(entry => entry[1].length > 0).sort((first, second) => second[1].length - first[1].length).map(entry => entry[0])[0];
                
                responsesQueue.push(new TurnResponseMessage(sorted[suitOfLeast][0], data));
                return;
            }
        } catch {}
        responsesQueue.push(new TurnResponseMessage(hand[0], data));
    }

    message(gameState: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>, message: StatusMessage): void {
        const data = wrapData(gameState);
        const { currentTrick } = gameState;
        if(message.type === 'played-message') {
            if(currentTrick.length === 1) {
                data.numTimesPlayed[currentTrick[0].suit.letter]++;
            }
            if(currentTrick.length > 1 && message.card.suit !== currentTrick[0].suit) {
                data.playerOutOfSuit[message.player] = [...(data.playerOutOfSuit[message.player] || []) as Suit[], currentTrick[0].suit].filter((val, index, arr) => arr.indexOf(val) === index);
            }
            responsesQueue.push(new DataResponseMessage(data));
        }
    }

    waitingFor(): void {
    }

    // shouldTryToShootTheMoon(handlerData: HandlerData) {
    //     for(let player = 0; player < handlerData.numPlayers; player++)
    //         if(player !== handlerData.position) {
    //             if(handlerData.pointsTaken[player] > 0) {
    //                 return false;
    //             }
    //         }
    //     }
    // }
}