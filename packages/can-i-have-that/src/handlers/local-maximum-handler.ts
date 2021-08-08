import { Card, ThreeCardSet, FourCardRun, HandlerResponsesQueue, Suit, DiscardResponseMessage } from '@cards-ts/core';
import { GameHandler, HandlerData } from '../game-handler';
import { WantCardResponseMessage, GoDownResponseMessage, PlayResponseMessage } from '../messages/response';
import { find } from '../util/find';

export class LocalMaximumHandler extends GameHandler {
    handleWantCard = ({hand, melds: { melds }, players: { position }, canIHaveThat: { round }, params: { rounds }, deck: { deckCard }, turn, ask}: HandlerData, responsesQueue: HandlerResponsesQueue<WantCardResponseMessage>): void => {
        const currentRound = rounds[round];
        const wouldBeTurn = turn === ask;
        if(melds[position].length > 0) {
            responsesQueue.push(new WantCardResponseMessage(false));
            return;
        }
        if((deckCard as Card).isWild()) {
            // console.log(position, 'want wild', card.toString());
            responsesQueue.push(new WantCardResponseMessage(true));
            return;
        }
        const oldFound = find([...hand], currentRound);
        const newFound = find([(deckCard as Card), ...hand], currentRound);
        const advantage = newFound[0] - oldFound[0];
        if(oldFound[0] === 0 && newFound[0] === 0 && wouldBeTurn && (round !== rounds.length - 1 ? newFound[1] <= oldFound[1] : newFound[3].length <= oldFound[3].length)) {
            // pickup card if it is our turn, we have already completed, and it doesn't add value to us
            // console.log(position, 'want card is turn', deckCard.toString());
            // console.log(oldFound[2].toString());
            // console.log(newFound[2].toString());
            responsesQueue.push(new WantCardResponseMessage(true));
            return;
        }
        if(round !== rounds.length - 1) {
            if(advantage < 0) {
                // if not last round and card would benefit us, grab it
                responsesQueue.push(new WantCardResponseMessage(true));
                return;
            }
        } else {
            if(advantage < 0) {
                // if last round and card would benefit us
                // grab only if we are lacking many cards or it will be our turn
                if(oldFound[0] > 4 || (wouldBeTurn && newFound[3].length < oldFound[3].length + 2)) {
                    // console.log(position, 'want card', deckCard.toString());
                    // console.log(oldFound[2].toString());
                    // console.log(newFound[2].toString());
                    responsesQueue.push(new WantCardResponseMessage(true));
                    return;
                }
            }
        }
        responsesQueue.push(new WantCardResponseMessage(false));
        return;
    }

    handleTurn = ({hand, melds: { melds }, players: { position }, canIHaveThat: { round }, params: { rounds }}: HandlerData, responsesQueue: HandlerResponsesQueue<DiscardResponseMessage | GoDownResponseMessage | PlayResponseMessage>) => {
        const currentRound = rounds[round];
        if(melds[position].length === 0) {
            const found = find([...hand], currentRound);
            // console.log(currentRound.toString(), 'Need', found[0], 'Extra', found[3].length, found[2].toString());
            const without = (arr: Card[], card: Card) => {const result = arr.slice(); result.splice(arr.indexOf(card), 1); return result;};
            if(found[0] === 0 && (rounds.length - 1 !== round || found[1] === 0)) {
                // TODO with handling of no discard on all down move this up
                // console.log(position, 'can play', found[2].toString());
                const newMelds = found[2].map((cards, i) => currentRound[i] === 3 ? new ThreeCardSet(cards) : new FourCardRun(cards));
                melds[position] = newMelds;
                responsesQueue.push(new GoDownResponseMessage(newMelds));
                for(const meld of newMelds) {
                    for(const card of meld.cards) {
                        const index = hand.indexOf(card);
                        hand.splice(index, 1);
                    }
                }
            } else {
                let possibleDiscards = [];
                if(found[0] === 0) {
                    possibleDiscards.push(...found[3].filter(card => !melds.some(player => player.some(play => play.isLive(card)))));
                }
                if(!possibleDiscards.length) {
                    possibleDiscards.push(...hand.filter(card => !melds.some(player => player.some(play => play.isLive(card)))));
                }
                // console.log(possibleDiscards.toString());
                if(possibleDiscards.some(card => !card.isWild())) {
                    // otherwise has a tendency to discard wilds which normally benefits other players more than us
                    possibleDiscards = possibleDiscards.filter(card => !card.isWild());
                }
                const suitMap = Object.fromEntries(Suit.suits.map(suit => [suit.letter, new Array<Card>()]));
                const finds = possibleDiscards.map(card => find(without(hand, card), currentRound) );
                let worst = 0;
                for(let i = 0; i < finds.length; i++) {
                    // TODO can even add logic about discarding cards others don't desire
                    if(finds[i][0] === finds[worst][0]) {
                        if(round === rounds.length - 1){
                            // Prefer to throw away cards of different suit on last round
                            if(found[0] > 0 && found[0] <= 3 && suitMap[possibleDiscards[i].suit.letter].length < suitMap[possibleDiscards[worst].suit.letter].length) {
                                worst = i;
                                continue;
                            }
                            // Prefer to throw away card that would waste fewer cards
                            if(finds[i][3].length < finds[worst][3].length) {
                                worst = i;
                                continue;
                            }
                        }
                        // Prefer to throw away card that decreases our points most
                        if(finds[i][1] < finds[worst][1]) {
                            worst = i;
                        }
                    } else {
                        if(finds[i][0] < finds[worst][0]) {
                            worst = i;
                        }
                    }
                }
                // console.log('Discarding', possibleDiscards[worst].toString());
                responsesQueue.push(new DiscardResponseMessage(possibleDiscards[worst]));
            }
        }
        if(melds[position].length !== 0) {
            const savedOldMelds = melds.map(plays => plays.map(play => play.clone()));
            for(let i = 0; i < hand.length; i++) {
                const card = hand[i];
                for(let player = 0; player < melds.length; player++) {
                    for(let meld = 0; meld < melds[player].length; meld++) {
                        if(melds[player][meld].isLive(card)) {
                            melds[player][meld].add(card);
                            responsesQueue.push(new PlayResponseMessage(savedOldMelds[player][meld].clone(), [card], melds[player][meld].clone()));
                            hand.splice(i, 1);
                            i--;
                            break;
                        }
                    }
                    if(!hand.includes(card)) {
                        break;
                    }
                }
            }
        }
        if(hand[0]) { // TODO better?
            responsesQueue.push(new DiscardResponseMessage(hand[0]));
        }
        return;
    }
}