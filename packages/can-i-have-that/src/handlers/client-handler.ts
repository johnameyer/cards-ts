import { GameHandler, HandlerData } from '../game-handler';
import { GoDownResponseMessage, PlayResponseMessage, WantCardResponseMessage } from '../messages/response';
import { Card, DiscardResponseMessage, distinct, FourCardRun, HandlerResponsesQueue, InvalidError, Meld, ThreeCardSet } from '@cards-ts/core';

/**
 * Breaks up the decisions made during a turn into individual components
 */
export abstract class ClientHandler extends GameHandler {
    public abstract handleWantCard: ({ hand, melds: { melds }, players: { position }, canIHaveThat: { whoseAsk, round }, params: { rounds }, data }: HandlerData, queue: HandlerResponsesQueue<WantCardResponseMessage>) => Promise<void>;

    handleTurn = async ({ hand, melds: { melds }, players: { position }, canIHaveThat: { round }, params: { rounds }, data }: HandlerData, responsesQueue: HandlerResponsesQueue<GoDownResponseMessage | DiscardResponseMessage | PlayResponseMessage>): Promise<void> => {
        const currentRound = rounds[round];
        const last = round === rounds.length - 1;
        let hasGoneDown = melds[position].length !== 0;

        // Allow player to go down if they have not yet
        if(!hasGoneDown) {
            if(await this.wantToGoDown(hand, data)) {
                let toPlay: Meld[];
                ({ toPlay, hand } = await this.goDown(hand, currentRound, last, data));
                responsesQueue.push(new GoDownResponseMessage(toPlay));
                hasGoneDown = true;
            }
        }

        // Allow player to play on others if they have cards, have already played, and it is not the last round
        if(hand.length && melds[position].length && !last) {
            await this.playOnOthers(hand, melds, responsesQueue, data);
        }

        // If the player has cards left and they are not going down on the last round
        if(hand.length && !(last && hasGoneDown)) {
            const toDiscard = await this.discard(hand, currentRound, melds, data);
            hand.slice(hand.findIndex((card) => toDiscard.equals(card)));
            responsesQueue.push(new DiscardResponseMessage(toDiscard));
            return;
        }

        // TODO need to handle live cards - should go back and allow player to play?
        return;
    }

    superTurn = this.handleTurn;

    async playOnOthers(hand: Card[], played: Meld[][], responsesQueue: HandlerResponsesQueue<PlayResponseMessage>, data: unknown) {
        let runToPlayOn: Meld | null;
        while(hand.length && (runToPlayOn = await this.whichPlay(played.flat(), hand, data))) {
            await this.askToPlayOnRun(runToPlayOn, hand, responsesQueue, data);
        }
    }

    async goDown(hand: Card[], roun: (3 | 4)[], last: boolean, data: unknown): Promise<{toPlay: Meld[], hand: Card[]}> {
        const cardsLeft: Card[] = hand.slice();
        const toPlay = [];
        for(const num of roun) {
            const newRun = await this.createRun(num, cardsLeft, data);
            if(!newRun) {
                return { toPlay: [], hand };
            }
            toPlay.push(newRun);
            for(const cardToRemove of newRun.cards) {
                const index = cardsLeft.findIndex(card => card.equals(cardToRemove));
                if(index < 0) {
                    continue; 
                }
                cardsLeft.splice(index, 1);
            }
        }
        if(last && cardsLeft.length) {
            throw new InvalidError('Must play all cards on the last round');
        }
        return { toPlay, hand: cardsLeft };
    }

    async discard(cardsLeft: Card[], roun: (3 | 4)[], played: Meld[][], data: unknown) {
        let live: Card[];
        if(played.some((arr) => arr.length > 0)) {
            live = played.flat().map((run) => run.liveCards())
                .flat()
                .filter(distinct);
            live.sort(Card.compare);
            // TODO
        } else {
            live = [];
        }
        // TODO all cards are live what to do?
        const toDiscard = Card.fromObj(await this.discardChoice(cardsLeft, live, data));
        return toDiscard;
    }

    async askToPlayOnRun(run: Meld, hand: Card[], responsesQueue: HandlerResponsesQueue<PlayResponseMessage>, data: unknown) {
        if(run instanceof ThreeCardSet) {
            const cards: Card[] = await this.cardsToPlay(hand, run, data);
            if(!cards) {
                return;
            }
            cards.forEach((toRemove) => hand.splice(hand.findIndex((card) => toRemove.equals(card)), 1));
            const oldMeld = run.clone();
            run.add(...cards);
            responsesQueue.push(new PlayResponseMessage(oldMeld, cards, run));
        } else if(run instanceof FourCardRun) {
            const cards = await this.cardsToPlay(hand, run, data);

            // TODO add check for when to ask
            const moveToTop = await this.moveToTop(data);

            if(!cards) {
                return;
            }
            const oldMeld = run;
            for(const card of cards) {
                run.add(card, moveToTop);
                hand.splice(hand.findIndex(other => card.equals(other)), 1);
            }
            responsesQueue.push(new PlayResponseMessage(oldMeld, cards, run));
        }
    }

    async createRun(num: 3 | 4, cardsLeft: Card[], data: unknown) {
        const selected: Card[] = await this.selectCards(cardsLeft, num, data);
        if(!selected.length) {
            return null;
        }
        if(num === 3) {
            return new ThreeCardSet(selected);
        } 
        const [ wilds, nonwilds ] = selected.bifilter(card => card.rank.isWild());
        const run = nonwilds.sort(Card.compare);
        for(const wild of wilds) {
            const position = await this.insertWild(run, wild, data);
            run.splice(position, 0, wild);
        }
        return new FourCardRun(run);
        
    }

    abstract selectCards(cardsLeft: Card[], num: 3 | 4, data: unknown): Promise<Card[]>;

    abstract cardsToPlay(hand: Card[], run: Meld, data: unknown): Promise<Card[]>;

    abstract moveToTop(handlerData: unknown): Promise<boolean>;

    abstract whichPlay(runOptions: Meld[], hand: Card[], data: unknown): Promise<Meld | null>;

    abstract wantToGoDown(hand: Card[], data: unknown): Promise<boolean>;

    abstract discardChoice(cardsLeft: Card[], live: Card[], data: unknown): Promise<Card>;

    abstract insertWild(run: Card[], wild: Card, data: unknown): Promise<number>;
}
