import { Handler } from "../handler";
import { Card, distinct, flatten, FourCardRun, InvalidError, Meld, Message, ThreeCardSet } from "@cards-ts/core";
import { HandlerData } from "../handler-data";

/**
 * Breaks up the decisions made during a turn into individual components
 */
export abstract class ClientHandler implements Handler {
    public abstract async wantCard(card: Card, isTurn: boolean, {hand, played, position, round, gameParams: {rounds}, data}: HandlerData): Promise<[boolean, unknown?]>;
    
    public async turn({hand, played, position, round, gameParams: {rounds}, data}: HandlerData)
    : Promise<{ toDiscard: Card | null, toPlay: Meld[][] } | null> {
        let currentRound = rounds[round];
        const last = round == rounds.length - 1;
        let toPlay: Meld[][] = played;

        // Allow player to go down if they have not yet
        if (played[position].length === 0) {
            if (await this.wantToGoDown(hand, data)) {
                ({toPlay: toPlay[position], hand} = await this.goDown(hand, currentRound, last, data));
            }
        }

        // Allow player to play on others if they have cards, have already played, and it is not the last round
        if (hand.length && played[position].length && !last) {
            await this.playOnOthers(hand, played, data);
        }

        // If the player has cards left and they are not going down on the last round
        if (hand.length && !(last && toPlay[position].length)) {
            const toDiscard = await this.discard(hand, currentRound, played, data);
            hand.slice(hand.findIndex((card) => toDiscard.equals(card)));
            return { toDiscard, toPlay };
        }
        
        if (!hand.length) {
            return { toDiscard: null, toPlay };
        }

        // TODO need to handle live cards - should go back and allow player to play?
        return null;
    }

    async playOnOthers(hand: Card[], played: Meld[][], data: unknown) {
        let runToPlayOn: Meld | null;
        while (hand.length && (runToPlayOn = await this.whichPlay(played.reduce(flatten, []), hand, data))) {
            await this.askToPlayOnRun(runToPlayOn, hand, data);
        }
    }

    async goDown(hand: Card[], roun: (3 | 4)[], last: boolean, data: unknown): Promise<{toPlay: Meld[], hand: Card[]}> {
        let cardsLeft: Card[] = hand.slice();
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

    async askToPlayOnRun(run: Meld, hand: Card[], data: unknown) {
        if (run instanceof ThreeCardSet) {
            const cards: Card[] = await this.cardsToPlay(hand, run, data);
            if (!cards) {
                return;
            }
            cards.forEach((toRemove) => hand.splice(hand.findIndex((card) => toRemove.equals(card)), 1));
            run.add(...cards);
        } else if (run instanceof FourCardRun) {
            const cards = await this.cardsToPlay(hand, run, data);
            
            //TODO add check for when to ask
            const moveToTop = await this.moveToTop(data);

            if (!cards) {
                return;
            }
            for(let card of cards) {
                run.add(card, moveToTop);
                hand.splice(hand.findIndex(other => card.equals(other)), 1);
            }
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
            let [wilds, nonwilds] = selected.bifilter(card => card.rank.isWild());
            let run = nonwilds.sort(Card.compare);
            for (let wild of wilds) {
                let position = await this.insertWild(run, wild, data);
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

    abstract getName(): string;
    
    abstract message(message: Message, data: unknown): void;
    
    abstract waitingFor(who: string | undefined): void;
}

export namespace ClientHandler {
    export interface Delegate {

    }
}