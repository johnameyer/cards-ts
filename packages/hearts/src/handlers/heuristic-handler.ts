import { GameHandlerParams } from '../game-handler';
import { HandlerData } from '../handler-data';
import { Card, combinations, distinct, Handler, HandlerResponsesQueue, MessageHandlerParams } from '@cards-ts/core';
import { Message } from '@cards-ts/core';
import { Suit } from '@cards-ts/core';
import { Rank } from '@cards-ts/core';
import { DataResponseMessage, PassResponseMessage, TurnResponseMessage } from '../messages/response';
import { ResponseMessage } from '../messages/response-message';
import { PlayedMessage } from '../messages/status';

const tuple = <T extends any[]>(...args: T): T => args;

interface HeuristicHandlerData {
    playerOutOfSuit: {[player: string]: Suit[]};
    numTimesPlayed: {[letter: string]: number};
    queenPlayed: boolean;
}

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
    // TODO try to share points based on who has taken the most this round / game

    // If we have a dangerous spade KS, AS, throw that away
    let highSpades = hand.find(card => card.suit === Suit.SPADES && card.rank.difference(Rank.QUEEN) < 0);
    if(highSpades) {
        return highSpades;
    }

    // If we have the queen of spades and we're in danger of throwing it out too soon
    if(sorted[Suit.SPADES.letter]?.length < 3 - data.numTimesPlayed[Suit.SPADES.letter]) {
        const danger = hand.find(card => card.equals(QS));
        if(danger && canBeHeart) {
            return danger;
        }
    }

    let throwable = hand;
    if(!canBeHeart) {
        throwable = throwable.filter(card => card.suit !== Suit.HEARTS && !card.equals(QS));
    }

    // Throw out high of other suit, based on how bad shape we are in that suit
    let worstSuits = Suit.suits
        .filter(suit => sorted[suit.letter].length)
        .map(suit => tuple(suit, sorted[suit.letter].reduce((sum, card) => sum += card.rank.order, 0) / sorted[suit.letter].length))
        .sort((a, b) => b[1] - a[1])
        .map(([suit, _]) => suit);

    if(!canBeHeart) {
        worstSuits = worstSuits.filter(suit => suit !== Suit.HEARTS);
    }

    const worstOfSuit = sorted[worstSuits[0].letter].slice().sort(Card.compare).reverse()[0];
    if(worstOfSuit.equals(QS) && !canBeHeart) {
        return sorted[worstSuits[0].letter].slice().sort(Card.compare).reverse()[1] || sorted[worstSuits[1].letter].slice().sort(Card.compare).reverse()[0];
    }
    return worstOfSuit;
}

function wrapData(handlerData: HandlerData) {
    // @ts-ignore
    if(!handlerData.data?.playerOutOfSuit) {
        handlerData.data = {
            playerOutOfSuit: {},
            numTimesPlayed: emptyCounter(),
            queenPlayed: false
        };
    }

    return handlerData.data as HeuristicHandlerData;
}

export class HeuristicHandler implements Handler<GameHandlerParams & MessageHandlerParams, HandlerData, ResponseMessage> {
    canHandle(key: any): key is keyof GameHandlerParams | 'message' {
        return key === 'pass' || key === 'turn' || key === 'message';
    }

    pass = (handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void => {
        const data = wrapData(handlerData);
        const { hand, gameParams: { numToPass } } = handlerData;
        const toPass = [];
        const sorted = hand.reduce<{[s: string]: Card[]}>((obj, card) => {
            const suit = card.suit;
            obj[suit.letter].push(card);
            return obj;
        }, emptyGrouper());

        // Try to throw away clubs and diamonds first
        const count = (arr: Suit[]) => arr.map(suit => sorted[suit.letter].length).reduce((a, b) => a + b, 0);
        const throwawaySuits = [Suit.CLUBS, Suit.DIAMONDS];
        const countSorted = combinations(throwawaySuits).sort((a, b) => count(a) - count(b));
        let i = 0;
        while(countSorted[i] && count(countSorted[i]) <= numToPass) {
            i++;
        }
        i--;
        const deleteSuit = hand.filter(card => countSorted[i].includes(card.suit));

        toPass.push(...deleteSuit);
        if(toPass.length === numToPass) {
            responsesQueue.push(new PassResponseMessage(toPass, data));
            return;
        }

        // Then try to throw away dangerous spades if we can't be rid of a suit
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
                    toPass.push(spades[kingIndex]);
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

        // Then try to throw away our high cards of the safe suits
        toPass.push(...hand.filter(card => [Suit.CLUBS, Suit.DIAMONDS].includes(card.suit)).sort(Card.compare).reverse());

        responsesQueue.push(new PassResponseMessage(toPass.filter(distinct).slice(0, numToPass), data));
        return;
    }

    turn = (handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void => {
        const data = wrapData(handlerData);
        const { hand, currentTrick, tricks, pointsTaken } = handlerData;
        const canBeHeart = !pointsTaken.every(point => point === 0);
        try {
            const sorted = hand.reduce<{[s: string]: Card[]}>((obj, card) => {
                const suit = card.suit;
                obj[suit.letter].push(card);
                return obj;
            }, emptyGrouper());

            if(tricks === 0) {
                // if the first trick
                if(sorted[Suit.CLUBS.letter]?.length) {
                    // Throw high club on first trick
                    responsesQueue.push(new TurnResponseMessage(sorted[Suit.CLUBS.letter].sort(Card.compare).reverse()[0], data));
                    return;
                } else {
                    // Or another card, considering we can't throw a heart
                    responsesQueue.push(new TurnResponseMessage(throwAwayRisk(hand, sorted, false, data), data));
                    return;
                }
            }

            if(currentTrick.length) {
                const follow = currentTrick[0].suit;
                const winningRank = currentTrick.filter(card => card.suit === follow).sort(Card.compare).reverse()[0].rank;

                const pointsInTrick = currentTrick.reduce((count, card) => count + (QS.equals(card) ? 13 : (card.suit === Suit.HEARTS ? 1 : 0)), 0);

                const cardsOfSuitAscending = hand.filter(card => card.suit === follow).sort(Card.compare);
                const cardsOfSuitDescending = cardsOfSuitAscending.slice().reverse();

                if(cardsOfSuitDescending.length == 0) {
                    // Throw a dangerour card away
                    responsesQueue.push(new TurnResponseMessage(throwAwayRisk(hand, sorted, true, data), data));
                    return;
                }
                if(currentTrick.length === 3) {
                    if(pointsInTrick <= 1 && follow !== Suit.HEARTS) {
                        // Take a safe trick
                        const nondanger = cardsOfSuitDescending.filter(card => !QS.equals(card))[0];
                        if(nondanger) {
                            responsesQueue.push(new TurnResponseMessage(nondanger, data));
                            return;
                        }
                    }
                }
                if(follow != Suit.HEARTS && !Object.values(data.playerOutOfSuit).some(arr => arr.includes(follow)) && data.numTimesPlayed[follow.letter] == 1) {
                    // Safe-ish round, throw a high card
                    if(follow !== Suit.SPADES) {
                        responsesQueue.push(new TurnResponseMessage(cardsOfSuitDescending[0], data));
                        return;
                    }
                    const spade = cardsOfSuitDescending.filter(card => card.rank.difference(Rank.QUEEN) > 0)[0];
                    if(spade) {
                        responsesQueue.push(new TurnResponseMessage(spade, data));
                        return;
                    }
                }
                const underplay = cardsOfSuitDescending.find(card => card.rank.difference(winningRank) > 0);
                if(underplay) {
                    // Undershoot
                    responsesQueue.push(new TurnResponseMessage(underplay, data));
                    return;
                }
                const nearplay = cardsOfSuitAscending.find(card => -card.rank.difference(winningRank) <= 2 - Math.floor(currentTrick.length / 2));
                if(currentTrick.length != 3 && (data.numTimesPlayed[follow.letter] > 0 || follow == Suit.HEARTS) && nearplay) {
                    // We can't underplay, so try to play relatively close
                    responsesQueue.push(new TurnResponseMessage(nearplay, data));
                    return;
                }
                if(follow === Suit.SPADES) {
                    const nondanger = cardsOfSuitDescending.filter(card => card.rank.difference(Rank.QUEEN) > 0)[0];
                    if(nondanger) {
                        // Play a spade that won't attract the queen
                        responsesQueue.push(new TurnResponseMessage(nondanger, data));
                        return;
                    }
                }
                // We probably are doomed on this hand, so just go high anyway
                responsesQueue.push(new TurnResponseMessage(cardsOfSuitDescending[0], data));
                return;
            } else {
                if(sorted[Suit.SPADES.letter]?.length > 3){
                    // Bring out dead - try to pull out the queen
                    responsesQueue.push(new TurnResponseMessage(sorted[Suit.SPADES.letter].sort(Card.compare)[0], data));
                    return;
                }

                if(canBeHeart && sorted[Suit.HEARTS.letter]?.length) {
                    let card;
                    if(data.numTimesPlayed[Suit.HEARTS.letter] == 0) {
                        card = sorted[Suit.HEARTS.letter].sort(Card.compare).map((card, index) => ({card, lower: card.rank.order - Rank.TWO.order - index})).filter(({card, lower}) => lower <= 2).reverse()[0]?.card;
                    } else {
                        card = sorted[Suit.HEARTS.letter].sort(Card.compare).map((card, index) => ({card, lower: card.rank.order - Rank.TWO.order - index})).filter(({card, lower}) => lower <= 4).reverse()[0]?.card;
                    }
                    if(card) {
                        // Start a land war - low hearts we will probably win
                        responsesQueue.push(new TurnResponseMessage(card, data));
                        return;
                    }
                }

                const suitOfLeast = [
                    ...Object.entries(sorted)
                    .filter(entry => entry[0] !== Suit.HEARTS.letter)
                    .filter(entry => entry[0] !== Suit.SPADES.letter || data.queenPlayed || !(entry[1].some(card => card.rank.difference(Rank.QUEEN) > 0)))
                    .filter(entry => entry[1].length > 0)
                    .sort((first, second) => second[1].length - first[1].length)
                    .map(entry => entry[0]),
                    Suit.HEARTS.letter
                ];

                // Start with suit we have least of, avoiding queen and hearts
                const least = sorted[suitOfLeast[0]].sort(Card.compare);
                // TODO don't start with 2/3 on first of suit?
                if(!QS.equals(least[0])) {
                    responsesQueue.push(new TurnResponseMessage(least[0], data));
                    return;
                } else if(least.length > 1){
                    responsesQueue.push(new TurnResponseMessage(least[1], data));
                    return;
                } else if(suitOfLeast.length > 1) {
                    responsesQueue.push(new TurnResponseMessage(sorted[suitOfLeast[1]].sort(Card.compare)[0], data));
                    return;
                }
                
                responsesQueue.push(new TurnResponseMessage(hand.filter(card => !QS.equals(card))[0], data));
            }
        } catch (e) {
            // console.error(e);
        }
        // Logic failed
        responsesQueue.push(new TurnResponseMessage(hand[0], data));
    }

    message = (gameState: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>, message: Message): void => {
        const data = wrapData(gameState);
        const { currentTrick } = gameState;
        if(isPlayedMessage(message)) {
            if(data.numTimesPlayed[Suit.CLUBS.letter] === 0) {
                data.numTimesPlayed[Suit.CLUBS.letter]++;
            }
            if(currentTrick.length === 1) {
                data.numTimesPlayed[currentTrick[0].suit.letter]++;
            }
            if(currentTrick.length > 1 && message.card.suit !== currentTrick[0].suit) {
                data.playerOutOfSuit[message.player] = [...(data.playerOutOfSuit[message.player] || []) as Suit[], currentTrick[0].suit].filter((val, index, arr) => arr.indexOf(val) === index);
            }
            if(QS.equals(message.card)) { 
                data.queenPlayed = true;
            }
            // TODO consider handle someone playing low on safe trick
            responsesQueue.push(new DataResponseMessage(data));
        }
        // TODO handle getting passed all of same suit
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

function isPlayedMessage(message: Message): message is PlayedMessage {
    return message.type === 'played-message';
}
