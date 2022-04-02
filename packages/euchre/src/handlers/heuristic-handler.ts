import { Serializable } from 'child_process';
import { GameHandlerParams } from '../game-handler-params';
import { HandlerData } from '../game-handler';
import { OrderUpResponseMessage, NameTrumpResponseMessage, DealerDiscardResponseMessage } from '../messages/response';
import { ResponseMessage } from '../messages/response-message';
import { PlayedMessage } from '../messages/status';
import { followsTrick } from '../util/follows-trick';
import { getTeamFor } from '../util/teams';
import { getComplementarySuit } from '../util/suit-colors';
import { winningPlay } from '../util/winning-play';
import { Rank } from '@cards-ts/core';
import { Suit } from '@cards-ts/core';
import { Message } from '@cards-ts/core';
import { Card, DataResponseMessage, Handler, HandlerResponsesQueue, MessageHandlerParams, PlayCardResponseMessage } from '@cards-ts/core';


interface HeuristicHandlerData {
    [key: string]: Serializable;

    playerOutOfSuit: {[player: string]: Suit[]};
    numTimesPlayed: {[letter: string]: number};
}


const emptyCounter = () => {
    const obj: {[letter: string]: number} = {};
    obj[Suit.SPADES.letter] = 0;
    obj[Suit.CLUBS.letter] = 0;
    obj[Suit.HEARTS.letter] = 0;
    obj[Suit.DIAMONDS.letter] = 0;
    return obj;
};

function wrapData(handlerData: HandlerData) {
    // @ts-ignore
    if(!handlerData.data?.playerOutOfSuit) {
        handlerData.data = {
            playerOutOfSuit: {},
            numTimesPlayed: emptyCounter(),
        };
    }

    return handlerData.data as HeuristicHandlerData;
}

export class HeuristicHandler implements Handler<GameHandlerParams & MessageHandlerParams, HandlerData, ResponseMessage> {
    private cardScore(card: Card, trumpSuit: Suit): number {
        if(card.suit === getComplementarySuit(trumpSuit) && card.rank === Rank.JACK) {
            return 4 * Rank.NINE.difference(Rank.ACE) + 1;
        } else if(card.suit === trumpSuit) {
            if(card.rank === Rank.JACK) {
                return 4 * Rank.NINE.difference(Rank.ACE) + 1;
            }
            return 3 * Rank.NINE.difference(Rank.ACE) + Rank.NINE.difference(card.rank);
        } 
        return Rank.NINE.difference(card.rank);
        
    }

    private cardsScore(cards: Card[], trumpSuit: Suit) {
        return cards.map(card => this.cardScore(card, trumpSuit)).map(x => Math.max(x, 0))
            .reduce((a, b) => a + b, 0);
    }

    handleOrderUp = (handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void => {
        const { hand, players: { position }, deck: { dealer }, euchre: { currentTrump, flippedCard }, params: gameParams } = handlerData;
        let score = this.cardsScore(hand, currentTrump);
        if(getTeamFor(position, gameParams).includes(dealer)) {
            score += this.cardScore(flippedCard, currentTrump);
        }
        /*
         * console.log(flippedCard.toString());
         * console.log(hand.filter(card => followsTrick([flippedCard], currentTrump, card)).map(card => card.toString()));
         * console.log(score);
         * console.log();
         */

        // calculate based on who passed so far

        responsesQueue.push(new OrderUpResponseMessage(score > 55)); // 60?
    };

    handleNameTrump = (handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void => {
        const { hand, euchre: { flippedCard }} = handlerData;
        type SuitScore = [Suit, number];
        const [ suit, score ] = Suit.suits.filter(suit => suit !== flippedCard.suit)
            .map(suit => [ suit, this.cardsScore(hand, suit) ] as SuitScore)
            .reduce((best, next) => next[1] > best[1] ? next : best);

        /*
         * console.log(suit);
         * console.log(hand.map(card => card.toString()));
         * console.log(score);
         * console.log();
         */

        responsesQueue.push(new NameTrumpResponseMessage(score > 55 ? suit : undefined));
    };

    handleDealerDiscard = (handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void => {
        const { hand } = handlerData;
        responsesQueue.push(new DealerDiscardResponseMessage(hand[0]));
    };

    handleTurn = (handlerData: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>): void => {
        const data = wrapData(handlerData);
        const { hand, euchre: { currentTrump }, trick: { currentTrick }} = handlerData;
        let playable = hand.filter(card => followsTrick(currentTrick, currentTrump, card));
        if(!playable.length) {
            playable = hand;
        }
        try {
        } catch (e) {
            const wouldWin = playable.filter(card => winningPlay([ ...currentTrick, card ], currentTrump) === currentTrick.length);
            if(!wouldWin) {
                const throwaway = playable.slice().sort(Card.compare)[0];
                responsesQueue.push(new PlayCardResponseMessage(throwaway, data));
            } else {
                const winner = wouldWin.slice().sort(Card.compare)[0];
                responsesQueue.push(new PlayCardResponseMessage(winner, data));
            }
            // console.error(e);
        }
        // Logic failed
        const fallbackCard = hand.filter(card => followsTrick(currentTrick, currentTrump, card))[0] || hand[0];
        // console.log(fallbackCard.toString());
        responsesQueue.push(new PlayCardResponseMessage(fallbackCard, data));
    };

    handleMessage = (gameState: HandlerData, responsesQueue: HandlerResponsesQueue<ResponseMessage>, message: Message): void => {
        const data = wrapData(gameState);
        const { trick: { currentTrick }} = gameState;
        if(isPlayedMessage(message)) {
            const followSuit = currentTrick.find(card => card)?.suit;
            if(followSuit) {
                data.numTimesPlayed[followSuit.letter]++;
            }
            if(followSuit && message.card.suit !== followSuit) {
                data.playerOutOfSuit[message.player] = [ ...(data.playerOutOfSuit[message.player] || []) as Suit[], followSuit ].filter((val, index, arr) => arr.indexOf(val) === index);
            }
            responsesQueue.push(new DataResponseMessage(data));
        }
    };
}

function isPlayedMessage(message: Message): message is PlayedMessage {
    return message.type === 'played-message';
}
