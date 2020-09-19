import { Handler } from "../handler";
import { HandlerData } from "../handler-data";
import { Card } from "../../cards/card";
import { Message } from "../../games/message";
import { Suit } from "../../cards/suit";
import { Rank } from "../../cards/rank";
import { combinations } from "../../util/combinations";
import { PlayedMessage } from "../messages/played-message";
import { distinct } from "../../util/distinct";

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

export class HeuristicHandler extends Handler {

    async pass({ hand, gameParams: { numToPass } }: HandlerData): Promise<[Card[], unknown?]> {
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
            return [toPass];
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
            return [toPass.slice(0, numToPass)];
        }

        toPass.push(...hand.filter(card => [Suit.CLUBS, Suit.DIAMONDS].includes(card.suit)).sort(Card.compare).reverse());

        return [toPass.slice(0, numToPass)];
    }

    async turn(handlerData: HandlerData): Promise<[Card, unknown?]> {
        const data = this.wrapData(handlerData);
        const { hand, currentTrick, tricks } = handlerData;
        const sorted = hand.reduce<{[s: string]: Card[]}>((obj, card) => {
            const suit = card.suit;
            obj[suit.letter].push(card);
            return obj;
        }, emptyGrouper());

        if(tricks === 0) {
            // if the first trick
            if(sorted[Suit.CLUBS.letter]?.length) {
                // throw out our highest club if possible
                return [sorted[Suit.CLUBS.letter].sort(Card.compare).reverse()[0]];
            } else {
                return [this.throwAwayRisk(hand, sorted, false, data)];
            }
        }

        if(currentTrick.length) {
            const follow = currentTrick[0].suit;

            const cardsOfSuit = hand.filter(card => card.suit === follow);

            if(cardsOfSuit.length > 0) {
                return [cardsOfSuit[0]];
            } else {
                return [hand.slice().sort(Card.compare).reverse()[0]];
            }
        } else {
            if(sorted[Suit.SPADES.letter]?.length > 3){
                return [sorted[Suit.SPADES.letter][0]];
            }
            const suitOfLeast = Object.entries(sorted).filter(entry => entry[0] !== Suit.HEARTS.letter).filter(entry => entry[1].length > 0).sort((first, second) => second[1].length - first[1].length).map(entry => entry[0])[0];
            
            return [sorted[suitOfLeast][0]];
        }

        return [hand[0]];
    }

    throwAwayRisk(hand: Card[], sorted: {[letter: string]: Card[]}, canBeHeart: boolean, data: HeuristicHandlerData) {
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

    message(message: Message, handlerData: HandlerData): void {
        const data = this.wrapData(handlerData);
        const { currentTrick } = handlerData;
        if(message instanceof PlayedMessage) {
            if(currentTrick.length === 1) {
                data.numTimesPlayed[currentTrick[0].suit.letter]++;
            }
            if(currentTrick.length > 1 && message.card.suit !== currentTrick[0].suit) {
                data.playerOutOfSuit[message.player] = [...(data.playerOutOfSuit[message.player] || []) as Suit[], currentTrick[0].suit].filter((val, index, arr) => arr.indexOf(val) === index);
            }
        }
    }

    waitingFor(who: string | undefined): void {
    }

    getName(taken: string[]): string {
        return ['Hugh'].find(str => !taken.includes(str)) || 'Hugh';
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


    wrapData(handlerData: HandlerData) {
        // @ts-ignore
        if(!handlerData.data?.playerOutOfSuit) {
            handlerData.data = {
                playerOutOfSuit: {},
                numTimesPlayed: emptyCounter()
            };
        }

        return handlerData.data as HeuristicHandlerData;
    }
}