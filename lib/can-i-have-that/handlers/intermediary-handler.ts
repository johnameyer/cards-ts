
// tslint:disable:no-console

import chalk from 'chalk';
import { Card } from '../../cards/card';
import { Run } from '../../cards/run';
import { ThreeCardSet } from '../../cards/three-card-set';
import { checkFourCardRunPossible } from '../../cards/four-card-run';
import { Rank } from '../../cards/rank';
import { Suit } from '../../cards/suit';
import { Message } from '../../games/message';
import { ClientHandler } from './client-handler';
import { HandlerData } from '../handler-data';
import { Intermediary } from '../../intermediary/intermediary';

function flatten<T>(reduction: T[], arr: T[]) {
    reduction.push(...arr);
    return reduction;
}

declare global {
    interface Array<T> {
        bifilter(filter: (item: T) => any): [T[], T[]];
    }
}

Array.prototype.bifilter = function<T>(filter: (item: T) => any): [T[], T[]] {
    return this.reduce(([match, nonMatch], item) => {
        if (filter(item)) {
            match.push(item);
        } else {
            nonMatch.push(item);
        }
        return [match, nonMatch];
    }, [[],[]]);
}

const toInquirerValue = <T extends {toString: () => string}>(t: T) => ({
    name: t.toString(),
    value: t,
});

export class IntermediaryHandler extends ClientHandler {
    private name!: string;

    constructor(private intermediary: Intermediary) {
        super();
    }

    public async askForName() {
        const message = ['What is your name?'];
        const name = await this.intermediary.input({message});
        this.name = name;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public message(message: Message) {
        console.log(Message.defaultTransformer(message.components));
    }

    waitingFor(who: string | undefined): void {
    }

    public async wantCard(card: Card, isTurn: boolean, {hand, played, position, round, gameParams: {rounds}}: HandlerData): Promise<[boolean]> {
        hand = hand.sort(Card.compare);
        const handWith = hand.slice();
        handWith.push(card);
        const prelude = [['You have', hand, 'on round', rounds[round]]];
        const message = ['Do you want', card];
        return [await this.intermediary.confirm({ prelude, message })];
    }

    public dealCard(card: Card, extra: Card | undefined, dealt: boolean) {
        if (dealt) {
            this.intermediary.print(['Received', card]);
        } else {
            if (extra) {
                this.intermediary.print(['Picked up', card, 'and', extra]);
            } else {
                this.intermediary.print(['Picked up', card]);
            }
        }
    }

    async playOnOthers(hand: Card[], played: Run[][], data: unknown) {
        while (hand.length && await this.wantToPlay(played.reduce(flatten, []), hand)) {
            const runToPlayOn = await this.whichPlay(played.reduce(flatten, []), hand);
            await this.askToPlayOnRun(runToPlayOn, hand, data);
        }
    }
    
    async selectCards(cardsLeft: Card[], num: number): Promise<Card[]> {
        return await this.intermediary.checkbox({
            message: ['Please enter cards in the '  + (num === 3 ? '3 of a kind' : '4 card run')],
            choices: cardsLeft.sort(Card.compare).map((card) => ({ name: card.toString(), value: card })),
            validate: (input: Card[]) => {
                if (input.length === 0) {
                    return true;
                }
                try {
                    validateSetSelection(num, input);
                    return true;
                } catch (e) {
                    return e;
                }
            },
        });
    }

    async cardsToPlay(hand: Card[], run: Run): Promise<Card[]> {
        return await this.intermediary.checkbox({
            message: ['Please select cards you\'d like to add'],
            choices: hand.sort(Card.compare).map(toInquirerValue),
            validate: (input: Card[]) => {
                if (!input || !input.length) {
                    return true;
                }
                try {
                    // TODO revisit
                    if(run.type === 3) {
                        new ThreeCardSet([...run.cards, ...input]);
                    } else {
                        checkFourCardRunPossible([...run.cards, ...input]);
                    }
                } catch (e) {
                    return e;
                }
                return true;
            }
        });
    }

    async moveToTop(): Promise<boolean> {
        return await this.intermediary.confirm({
            message: ['Would you like to move the old card to the top'],
        });
    }

    async wantToPlay(runOptions: Run[], hand: Card[]): Promise<boolean> {
        return await this.intermediary.confirm({
            prelude: [
                ['Player has', hand],
                ['Others have played', runOptions],
            ],
            message: ['Would you like to play cards on runs'],
        });
    }

    async whichPlay(runOptions: Run[], hand: Card[]): Promise<Run> {
        return await this.intermediary.list({
            message: ['Please choose which run you would like to play on'],
            choices: runOptions.map(toInquirerValue),
        });
    }

    async wantToGoDown(): Promise<boolean> {
        return await this.intermediary.confirm({
            message: ['Would you like to go down']
        });
    }

    async discardChoice(cardsLeft: Card[], live: Card[]): Promise<Card> {
        // TODO all cards are live what to do?
        return await this.intermediary.list({
            prelude: live.length ? [['The cards', live, 'are live']] : undefined,
            message: ['Select the card to discard'],
            choices: cardsLeft.filter(card => live.indexOf(card) === -1).sort(Card.compare).map(toInquirerValue)
        });
    }

    async insertWild(run: Card[], wild: Card): Promise<number> {
        return await this.intermediary.place({
            message: ['Please insert your wild cards'],
            choices: run.map(toInquirerValue),
            //TODO something up here
            //should support validate?
            placeholder: wild.toString(),
        });
    }
}

function validateSetSelection(num: number, input: Card[]) {
    if (num === 3) {
        new ThreeCardSet(input);
    } else {
        checkFourCardRunPossible(input);
    }
}