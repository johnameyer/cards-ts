import { Handler } from '../handler';
import { Card, distinct, flatten, FourCardRun, HandlerResponsesQueue, InvalidError, Meld, Message, ThreeCardSet } from '@cards-ts/core';
import { HandlerData } from '../handler-data';
import { DataResponseMessage, DiscardResponseMessage, GoDownResponseMessage, PlayResponseMessage, WantCardResponseMessage } from '../messages/response';

/**
 * Breaks up the decisions made during a turn into individual components
 */
export abstract class ClientHandler implements Handler {
    public abstract async wantCard({hand, played, position, round, wouldBeTurn, gameParams: {rounds}, data}: HandlerData, queue: HandlerResponsesQueue<WantCardResponseMessage>): Promise<void>;

    public async turn({hand, played, position, round, gameParams: {rounds}, data}: HandlerData, responsesQueue: HandlerResponsesQueue<GoDownResponseMessage | DiscardResponseMessage | PlayResponseMessage>): Promise<void> {
        const currentRound = rounds[round];
        const last = round === rounds.length - 1;
        let hasGoneDown = played[position].length !== 0;

        // Allow player to go down if they have not yet
        if (!hasGoneDown) {
            if (await this.wantToGoDown(hand, data)) {
                let toPlay: Meld[];
                ({toPlay, hand} = await this.goDown(hand, currentRound, last, data));
                responsesQueue.push(new GoDownResponseMessage(toPlay));
                hasGoneDown = true;
            }
        }

        // Allow player to play on others if they have cards, have already played, and it is not the last round
        if (hand.length && played[position].length && !last) {
            await this.playOnOthers(hand, played, responsesQueue, data);
        }

        // If the player has cards left and they are not going down on the last round
        if (hand.length && !(last && hasGoneDown)) {
            const toDiscard = await this.discard(hand, currentRound, played, data);
            hand.slice(hand.findIndex((card) => toDiscard.equals(card)));
            responsesQueue.push(new DiscardResponseMessage(toDiscard));
            return;
        }

        // TODO need to handle live cards - should go back and allow player to play?
        return;
    }

    async playOnOthers(hand: Card[], played: Meld[][], responsesQueue: HandlerResponsesQueue<PlayResponseMessage>, data: unknown) {
        let runToPlayOn: Meld | null;
        while (hand.length && (runToPlayOn = await this.whichPlay(played.reduce(flatten, []), hand, data))) {
            await this.askToPlayOnRun(runToPlayOn, hand, responsesQueue, data);
        }
    }

    async goDown(hand: Card[], roun: (3 | 4)[], last: boolean, data: unknown): Promise<{toPlay: Meld[], hand: Card[]}> {
        const cardsLeft: Card[] = hand.slice();
        const toPlay = [];
        for (const num of roun) {
            const newRun = await this.createRun(num, cardsLeft, data);
            if(!newRun) {
                return { toPlay: [], hand };
            }
            toPlay.push(newRun);
            for (const cardToRemove of newRun.cards) {
                const index = cardsLeft.findIndex(card => card.equals(cardToRemove));
                if(index < 0) continue;
                cardsLeft.splice(index, 1);
            }
        }
        if (last && cardsLeft.length) {
            throw new InvalidError('Must play all cards on the last round');
        }
        return {toPlay, hand: cardsLeft};
    }

    async discard(cardsLeft: Card[], roun: (3 | 4)[], played: Meld[][], data: unknown) {
        let live: Card[];
        if (played.some((arr) => arr.length > 0)) {
            live = played.reduce(flatten, []).map((run) => run.liveCards()).reduce(flatten, []).filter(distinct);
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
        if (run instanceof ThreeCardSet) {
            const cards: Card[] = await this.cardsToPlay(hand, run, data);
            if (!cards) {
                return;
            }
            cards.forEach((toRemove) => hand.splice(hand.findIndex((card) => toRemove.equals(card)), 1));
            const oldMeld = run.clone();
            run.add(...cards);
            responsesQueue.push(new PlayResponseMessage(oldMeld, cards, run));
        } else if (run instanceof FourCardRun) {
            const cards = await this.cardsToPlay(hand, run, data);

            // TODO add check for when to ask
            const moveToTop = await this.moveToTop(data);

            if (!cards) {
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
        if (!selected.length) {
            return null;
        }
        if (num === 3) {
            return new ThreeCardSet(selected);
        } else {
            const [wilds, nonwilds] = selected.bifilter(card => card.rank.isWild());
            const run = nonwilds.sort(Card.compare);
            for (const wild of wilds) {
                const position = await this.insertWild(run, wild, data);
                run.splice(position, 0, wild);
            }
            return new FourCardRun(run);
        }
    }

    abstract async selectCards(cardsLeft: Card[], num: 3 | 4, data: unknown): Promise<Card[]>;

    abstract async cardsToPlay(hand: Card[], run: Meld, data: unknown): Promise<Card[]>;

    abstract async moveToTop(handlerData: unknown): Promise<boolean>;

    abstract async whichPlay(runOptions: Meld[], hand: Card[], data: unknown): Promise<Meld | null>;

    abstract async wantToGoDown(hand: Card[], data: unknown): Promise<boolean>;

    abstract async discardChoice(cardsLeft: Card[], live: Card[], data: unknown): Promise<Card>;

    abstract async insertWild(run: Card[], wild: Card, data: unknown): Promise<number>;

    // abstract getName(): string;

    abstract message(handlerData: HandlerData, _: HandlerResponsesQueue<DataResponseMessage>, message: Message): Promise<void>;

    abstract waitingFor(handlerData: HandlerData, _: HandlerResponsesQueue<DataResponseMessage>, who: string[] | undefined): Promise<void>;
}

export namespace ClientHandler {
    export interface Delegate {

    }
}