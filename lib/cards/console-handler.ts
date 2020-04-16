
// tslint:disable:no-console

import chalk from 'chalk';
import inquirer = require('inquirer');
import { Handler } from './handler';
import { Card } from './card';
import { Run } from './run';
import { ThreeCardSet } from './three-card-set';
import { FourCardRun, checkFourCardRunPossible } from './four-card-run';
import { InvalidError } from './invalid-error';
import { Rank } from './rank';
import { Suit } from './suit';
import { Message } from './messages/message';

type Prompt<S extends string, T> = inquirer.Question<Record<S, T>> & {
    name: S,
    choices?: T[] | {name: string, value: T}[] | (() => T[]) | (() => {name: string, value: T}[]);
};

type MultiPrompt<S extends string, T> = inquirer.Question<Record<S, T[]>> & {
    name: S,
    choices?: T[] | {name: string, value: T}[] | (() => T[]) | (() => {name: string, value: T}[]);
};

function distinct(value: Card, index: number, arr: Card[]) {
    return arr.findIndex(other => value.equals(other)) === index;
}

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

inquirer.registerPrompt('selectLine', require('inquirer-select-line'));

export class ConsoleHandler extends Handler {

    private name!: string;

    constructor() {
        super();
    }

    public async askForName() {
        const message = 'What is your name?';
        const question: Prompt<'name', string> = {name: 'name', message, type: 'input'};
        const { name } = await inquirer.prompt([question]);
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public message(bundle: Message) {
        console.log(bundle.message);
    }

    public async wantCard(card: Card, hand: Card[], played: Run[], roun: number[], isTurn: boolean, last: boolean) {
        hand = hand.sort(Card.compare);
        const handWith = hand.slice();
        handWith.push(card);
        const found = find(handWith, roun, played);
        console.log('You have', formatFound(hand, found), 'on round', roun);
        const message = 'Do you want ' + formatFound([card], found);
        const question: Prompt<'want', boolean> = {name: 'want', message, type: 'confirm', default: false};
        const { want } = await inquirer.prompt([question]);
        return want;
    }

    public async turn(hand: Card[], played: Run[][], position: number, roun: number[], last: boolean):
        Promise<{ toDiscard: Card | null, toPlay: Run[][] } | null> {
        let toPlay: Run[][] = played;

        this.printHand(hand, roun, played[position]);
        if (played[position].length) {
            console.log('has played ', played[position].map((run) => run.toString()).join(' and '));
        }
        console.log('aiming for', roun);
        if (played[position].length === 0) {
            const message = 'Would you like to go down?';
            const question: Prompt<'goDown', boolean> = {name: 'goDown', type: 'confirm', message};
            if ((await inquirer.prompt([question]) as any).goDown) {
                ({toPlay: toPlay[position], hand} = await this.goDown(hand, roun, last));
            }
        } else {
            const firstMessage = 'Would you like to play cards on your runs?';
            const playQuestion: Prompt<'playCard', boolean> = {name: 'playCard', type: 'confirm', message: firstMessage};
            const additionalMessage = 'Would you like to play more cards on your runs?';
            const saved = played[position].slice();
            if ((await inquirer.prompt([playQuestion])).playCard) {
                const playQuestion = {name: 'playCard', type: 'confirm', message: additionalMessage};
                do {
                    const question = {
                        name: 'run',
                        message: 'Please enter which set you would like to play on',
                        type: 'list',
                        choices: saved.map(toInquirerValue),
                    };
                    const run: Run = (await inquirer.prompt([question]) as any).run;
                    if (!run) {
                        break;
                    }
                    await askToPlayOnRun(run, hand);
                    // TODO !(hand.length == 1 && !last || hand.length == 0 ) &&
                } while ( (await inquirer.prompt([playQuestion]) as {playCard: boolean}).playCard);
            }
        }
        const notMyHand = (item: Run[], index: number) => index != position;
        if (hand.length && played[position].length && !last) {
            if (played.filter(notMyHand).some((other) => other.length > 0)) {
                console.log('You still have' + hand);
                const wouldPlayOthers: Prompt<'wouldPlay', boolean> = {
                    name: 'wouldPlay',
                    message: 'Would you like to play a card on others',
                    type: 'confirm',
                };
                while ((await inquirer.prompt([wouldPlayOthers])).wouldPlay) {
                    const toPlayOn: Prompt<'toPlayOn', Run> = {
                        name: 'toPlayOn',
                        message: 'Please choose which run you would like to play on',
                        type: 'list',
                        choices: () => played.filter(notMyHand).reduce<Run[]>(flatten, []).map(toInquirerValue),
                    };
                    const runToPlayOn = (await inquirer.prompt([toPlayOn])).toPlayOn;
                    await askToPlayOnRun(runToPlayOn, hand);
                }
            }
        }
        if (!last && hand.length) {
            this.printHand(hand, roun, played[position]);
            const toDiscard = await this.discard(hand, roun, played);
            hand.slice(hand.findIndex((card) => toDiscard.equals(card)));
            return { toDiscard, toPlay };
        } else if (!hand.length) {
            return { toDiscard: null, toPlay };
        }
        // TODO need to handle live cards
        return null;
    }

    public async goDown(hand: Card[], roun: number[], last: boolean): Promise<{toPlay: Run[], hand: Card[]}> {
        let cardsLeft: Card[] = hand.slice();
        const toPlay = [];
        for (const num of roun) {
            const question: MultiPrompt<'run', Card> = {
                name: 'run',
                message: 'Please enter cards in the '  + (num === 3 ? '3 of a kind' : '4 card run'),
                type: 'checkbox',
                choices: () => cardsLeft.sort(Card.compare).map((card) => ({ name: card.toString(), value: card })),
                validate: async (input: Card[]) => {
                    if (input.length === 0) {
                        return true;
                    }
                    try {
                        await validateSetSelection(num, input);
                        return true;
                    } catch (e) {
                        return e;
                    }
                },
            };
            const selected: Card[] = (await inquirer.prompt([question])).run;
            if (!selected.length) {
                return { toPlay: [], hand };
            }
            cardsLeft = cardsLeft.filter((card) => !selected.find((w: Card | undefined) => card.equals(w)));
            if (num === 3) {
                toPlay.push(new ThreeCardSet(selected));
            } else {
                let [wilds, nonwilds] = selected.bifilter(card => card.rank.isWild());
                let run = nonwilds;
                for (let wild of wilds) {
                    let { position } = await inquirer.prompt([{
                        name: 'position',
                        message: 'Please insert your wild cards',
                        choices: run,
                        //should support validate?
                        placeholder: wild.toString(),
                        type: 'selectLine'
                    }]);
                    run.splice(position, 0, wild);
                }
                toPlay.push(new FourCardRun(run));
            }
        }
        if (last && cardsLeft.length) {
            throw new InvalidError('Must play all cards on the last round');
        }
        return {toPlay, hand: cardsLeft};
    }

    public async discard(cardsLeft: Card[], roun: number[], played: Run[][]) {
        let live: Card[];
        if (played.some((arr) => arr.length > 0)) {
            live = played.reduce(flatten, []).map((run) => run.liveCards()).reduce(flatten, []).filter(distinct);
            live.sort(Card.compare);
            // TODO console.log('Live cards are:', live.map((card) => card.toString()));
        } else {
            live = [];
        }
        // TODO all cards are live what to do?
        const toDiscardQuestion: Prompt<'toDiscard', Card> = {
            name: 'toDiscard',
            message: 'Select the card to discard',
            type: 'list',
            choices: cardsLeft.sort(Card.compare).map(toInquirerValue),
            validate: (choice: Card) => !live.some((card) => choice.equals(card)),
        };
        const { toDiscard } = (await inquirer.prompt([toDiscardQuestion]));
        return toDiscard;
    }

    public dealCard(card: Card, extra: Card | undefined, dealt: boolean) {
        if (dealt) {
            console.log('Received', card.toString());
        } else {
            if (extra) {
                console.log('Picked up', card.toString(), 'and', extra.toString());
            } else {
                console.log('Picked up', card.toString());
            }
        }
    }

    public printHand(hand: Card[], roun: number[], played: Run[]) {
        hand.sort();
        const found = find(hand, roun, played);
        console.log('Player has', formatFound(hand, found, true));
    }
}

async function validateSetSelection(num: number, input: Card[]) {
    if (num === 3) {
        new ThreeCardSet(input);
    } else {
        checkFourCardRunPossible(input);
    }
}

function mostCommon(cards: Card[], num: number): Array<[Rank, number]> {
    const counts = cards.reduce<{[rank: string]: number}>((reduction, card: Card) => {
        // TODO without toStrings
        reduction[card.rank.toString()] = (reduction[card.rank.toString()] || 0) + 1;
        return reduction;
    }, {});
    // TODO could use second reduction of some sort
    const best = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    best.slice(0, num);
    return best.map((rank: string) => [Rank.fromString(rank), counts[rank]]);
}

function mintree(numbers: number[], maxGaps: number) {
    numbers = [...new Set(numbers)].sort();
    const size: Array<[number, number, number, number]> = [];
    for (let i = 0; i < numbers.length; i++) {
        for (let j = numbers.length - 1; j > i + 1; j--) {
            const indexSpan = j - i;
            const valueSpan = numbers[j] - numbers[i];
            const gaps = valueSpan - indexSpan;
            if (gaps <= maxGaps) {
                size.push([numbers[i], numbers[j], indexSpan + 1, gaps]);
            }
        }
    }
    return size;
}

function find(cards: Card[], round: number[], played: Run[]): [Card[][], Card[][]] {
    if (played.length) {
        return [[], []];
    } else {
        // TODO go for new pair when already having two?
        const whole = cards.slice();
        const subset = whole.filter((a) => !a.isWild());
        const numWilds = whole.length - subset.length;
        const pickupAggressiveness = 1;
        let threes: Card[][] = [];
        const threesNeeded = round.filter((set: number) => set === 3).length;
        if (threesNeeded) {
            const common = mostCommon(subset, numWilds);
            const commonRanks = common.filter(([_, num]) => num > 1).map(([rank, _]) => rank);
            // should show for two of a kind or only three?
            threes = commonRanks.map((rank) => subset.filter((card) => card.rank === rank)).slice(0, threesNeeded);
        }
        const foursNeeded = round.length - threesNeeded;
        const fours: Card[][] = [];
        if (foursNeeded) {
            const suits = subset.reduce<{[suit: string]: Card[]}>((reduction: {[suit: string]: Card[]}, card: Card) => {
                const suit = card.suit.toString();
                reduction[suit] = reduction[suit] || [];
                reduction[suit].push(card);
                return reduction;
            }, {});
            const spanList: Array<Span<Card>> = [];

            type Span<T> = [T, T, number, number];
            const evalutator = <F>(item: Span<F>): number => {
                let num = item[2];
                let gaps = item[3];
                if(num > gaps) {
                    return gaps - 2*num
                        // - (item[0] != Rank.THREE.order && item[1] != Rank.ACE.order ? 1 : 0)
                        + Math.abs(num - 4)
                        + Math.abs(num + gaps - 4)
                    ;
                    //also add preference towards low cards
                }
                return 1;
            }

            for (const [suit, suitCards] of Object.entries(suits)) {
                const spans: Array<Span<number>> = mintree(suitCards.map((card) => Rank.ranks.indexOf(card.rank)), numWilds + pickupAggressiveness);
                const span = spans.sort((one, two) => evalutator(one) - evalutator(two))[0];
                if(!span) {
                    continue;
                }
                const lowerCard = new Card(Suit.fromString(suit), Rank.ranks[span[0]]);
                const higherCard = new Card(Suit.fromString(suit), Rank.ranks[span[1]]);
                const cardSpan: Span<Card> = [lowerCard, higherCard, span[2], span[3]];
                if (cardSpan) {
                    spanList.push(cardSpan);
                }
            }

            const selectedSpans = spanList.sort((one, two) => evalutator(one) - evalutator(two)).slice(0, foursNeeded).map((s: Span<Card>) => [s[0], s[1]]);
            for (const span of selectedSpans) {
                const inRange = (card: Card) => card.rank.difference(span[0].rank) <= 0 && card.rank.difference(span[1].rank) >= 0;
                fours.push(suits[span[0].suit.toString()].filter(inRange));
            }
        }
        // TODO perhaps should recalculate based on if it is in both
        return [threes, fours];
    }
}

function formatFound(cards: Card[], found: [Card[][], Card[][]], high = false) {
    const [threeRuns, fourRuns] = found;
    const threes: Card[] = threeRuns.reduce<Card[]>(flatten, []);
    const fours = fourRuns.reduce<Card[]>(flatten, []);
    const str: string[] = [];
    let first = high;
    for (const card of cards.slice().sort(Card.compare).reverse()) {
        const findCard = (x: Card) => card.equals(x);
        const cardStr: string = card.toString();
        if (threes.find(findCard)) {
            if (fours.find(findCard)) {
                str.push(chalk.magenta(cardStr));
            } else {
                str.push(chalk.cyan(cardStr));
            }
        } else if (fours.find(findCard)) {
            str.push(chalk.red(cardStr));
        } else if (card.isWild()) {
            str.push(chalk.green(cardStr));
        } else {
            if (first) {
                str.push(chalk.yellow(cardStr));
                first = false;
            } else {
                str.push(cardStr);
            }
        }
    }
    return str.reverse().join(' ');
}

async function askToPlayOnRun(run: Run, hand: Card[]) {
    if (run instanceof ThreeCardSet) {
        const cardToPlayQuestion = {
            name: 'cards',
            message: 'Please select cards you\'d like to play',
            type: 'checkbox',
            choices: () => hand.sort(Card.compare).map(toInquirerValue),
            validate: (input: Card[]) => {
                if (input.length === 0) {
                    return true;
                }
                try {
                    run.clone().add(...input);
                    return true;
                } catch (e) {
                    return e;
                }
            }
        };
        const cards: Card[] = (await inquirer.prompt([cardToPlayQuestion]) as any).cards;
        if (!cards) {
            return;
        }
        cards.forEach((toRemove) => hand.splice(hand.findIndex((card) => toRemove.equals(card)), 1));
        run.add(...cards);
    } else if (run instanceof FourCardRun) {
        const cardToPlayQuestions = [{
            name: 'run',
            message: 'Please select card you\'d like to add',
            type: 'list',
            choices: (x: inquirer.Answers) => {
                const none = {name: 'Escape', value: null};
                const cards = hand.sort(Card.compare).map(toInquirerValue);
                return [none, ...cards];
            },
            validate: (input: Card | null) => {
                if (!input) {
                    return true;
                }
                try {
                    run.clone().add(input);
                } catch (e) {
                    return e;
                }
            }
        }, {
            name: 'moveToTop',
            message: 'Would you like to move the old card to the top (if applicable)',
            // TODO change when to only ask when relevant
            type: 'confirm',
            when: (answers: any) => {
                return answers.run !== null;
            },
        }];
        const result = await inquirer.prompt(cardToPlayQuestions);
        if (!result.cards) {
            return;
        }
        run.add(result.card, result.moveToTop);
        hand.splice(hand.findIndex(result.card.equals), 1);
    }
}
