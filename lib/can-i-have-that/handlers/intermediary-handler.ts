
// tslint:disable:no-console

import { Card } from '../../cards/card';
import { Meld } from '../../cards/meld';
import { ThreeCardSet } from '../../cards/three-card-set';
import { checkFourCardRunPossible, FourCardRun } from '../../cards/four-card-run';
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
        const [name] = await this.intermediary.form({ type:'input', message });
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
        this.intermediary.print(message.components);
    }

    waitingFor(who: string | undefined): void {
    }

    public async wantCard(card: Card, isTurn: boolean, {hand, round, gameParams: {rounds}}: HandlerData): Promise<[boolean]> {
        hand = hand.sort(Card.compare);
        const handWith = hand.slice();
        handWith.push(card);
        const message = ['Do you want', card];
        if(!isTurn) {
            message.push('and an extra?');
        } else {
            message.push('?');
        }
        return [(await this.intermediary.form(
            { type: 'print', message: ['It is round', rounds[round]]},
            {type: 'printCards', cards: hand},
            { type: 'confirm', message })
        )[2]];
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

    async playOnOthers(hand: Card[], played: (ThreeCardSet | FourCardRun)[][], data: unknown) {
        while (hand.length && await this.wantToPlay(played.reduce(flatten, []), hand)) {
            const runToPlayOn = await this.whichPlay(played.reduce(flatten, []), hand);
            await this.askToPlayOnRun(runToPlayOn, hand, data);
        }
    }
    
    async selectCards(cardsLeft: Card[], num: 3 | 4): Promise<Card[]> {
        return (await this.intermediary.form({
            type: 'checkbox',
            message: ['Please enter cards in the '  + (num === 3 ? '3 of a kind' : '4 card run')],
            choices: cardsLeft.sort(Card.compare).map((card) => ({ name: card.toString(), value: card })),
            // @ts-ignore
            validate: validateSelectCards,
            validateParam: { num }
        }))[0] as Card[];
    }

    async cardsToPlay(hand: Card[], run: Meld): Promise<Card[]> {
        return (await this.intermediary.form({
            type: 'checkbox',
            message: ['Please select cards you\'d like to add'],
            choices: hand.sort(Card.compare).map(toInquirerValue),
            // @ts-ignore
            validate: validateCardsToPlay,
            validateParam: { run: run as ThreeCardSet | FourCardRun }
        }))[0] as Card[];
    }

    async moveToTop(): Promise<boolean> {
        return (await this.intermediary.form({
            type: 'confirm',
            message: ['Would you like to move the old card to the top'],
        }))[0];
    }

    async wantToPlay(runOptions: Meld[], hand: Card[]): Promise<boolean> {
        return (await this.intermediary.form({
            type: 'print',
            message: ['Player has', hand],
        }, {
            type: 'print',
            message: ['Others have played', runOptions as (ThreeCardSet | FourCardRun)[]],
        }, {
            type:'confirm',
            message: ['Would you like to play cards on runs'],
        }))[2];
    }

    async whichPlay(runOptions: (ThreeCardSet | FourCardRun)[], hand: Card[]): Promise<Meld> {
        return (await this.intermediary.form({
            type: 'list',
            message: ['Please choose which run you would like to play on'],
            choices: runOptions.map(toInquirerValue),
        }))[0] as Meld;
    }

    async wantToGoDown(hand: Card[]): Promise<boolean> {
        return (await this.intermediary.form({
            type: 'printCards',
            cards: hand,
        },{
            type: 'confirm',
            message: ['Would you like to go down']
        }))[1];
    }

    async discardChoice(cardsLeft: Card[], live: Card[]): Promise<Card> {
        // TODO all cards are live what to do?
        return (await this.intermediary.form({
            type: 'print',
            message: live.length ? ['The cards', live, 'are live'] : undefined,
        },{
            type: 'list',
            message: ['Select the card to discard'],
            choices: cardsLeft.filter(card => live.indexOf(card) === -1).sort(Card.compare).map(toInquirerValue)
        }))[1] as Card;
    }

    async insertWild(run: Card[], wild: Card): Promise<number> {
        return (await this.intermediary.form({
            type: 'place',
            message: ['Please insert your wild card'],
            choices: run.map(toInquirerValue),
            //TODO something up here
            //should support validate?
            placeholder: wild.toString(),
        }))[0];
    }
}

function validateCardsToPlay(input: Card[], { run }: {run: Meld}): string | boolean | Promise<string | boolean> {
    if (!input || !input.length) {
        return true;
    }
    try {
        // TODO revisit
        if (run.runType === 3) {
            new ThreeCardSet([...run.cards, ...input]);
        }
        else {
            checkFourCardRunPossible([...run.cards, ...input]);
        }
    }
    catch (e) {
        return e.toString();
    }
    return true;
}

function validateSelectCards(input: Card[], { num }: { num: 3 | 4 }) {
    if (input.length === 0) {
        return true;
    }
    try {
        validateSetSelection(num, input);
        return true;
    } catch (e) {
        return e.toString();
    }
}

function validateSetSelection(num: number, input: Card[]) {
    if (num === 3) {
        new ThreeCardSet(input);
    } else {
        checkFourCardRunPossible(input);
    }
}