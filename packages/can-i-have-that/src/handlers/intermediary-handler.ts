import { HandlerData } from '../game-handler.js';
import { WantCardResponseMessage, GoDownResponseMessage, PlayResponseMessage } from '../messages/response/index.js';
import { roundToString } from '../util/round-to-string.js';
import { ClientHandler } from './client-handler.js';
import { Card, Intermediary, ThreeCardSet, FourCardRun, checkFourCardRunPossible, HandlerResponsesQueue, DiscardResponseMessage, Meld, Serializable } from '@cards-ts/core';

function flatten<T>(reduction: T[], arr: T[]) {
    reduction.push(...arr);
    return reduction;
}

declare global {
    interface Array<T> {
        bifilter(filter: (item: T) => any): [T[], T[]];
    }
}

Array.prototype.bifilter = function <T>(filter: (item: T) => any): [T[], T[]] {
    return this.reduce(
        ([match, nonMatch], item) => {
            if (filter(item)) {
                match.push(item);
            } else {
                nonMatch.push(item);
            }
            return [match, nonMatch];
        },
        [[], []],
    );
};

const toInquirerValue = <T extends { toString: () => string }>(t: T) => ({
    name: t.toString(),
    value: t,
});

function reconcileDataAndHand(hand: Card[], data: any): { hand: Card[] } {
    if (!data) {
        data = {};
    }
    if (!data.hand) {
        data.hand = hand;
    } else {
        // TODO handle duplicates?
        for (let i = 0; i < hand.length; i++) {
            if (!(data.hand as Card[]).find(card => card.equals(hand[i]))) {
                data.hand.push(hand[i]);
            }
        }

        for (let i = 0; i < data.hand.length; i++) {
            if (!hand.find(card => card.equals(data.hand[i]))) {
                data.hand.splice(i, 1);
                i--;
            }
        }
    }
    return data;
}

export class IntermediaryHandler extends ClientHandler {
    constructor(private intermediary: Intermediary) {
        super();
    }

    handleWantCard = async (
        { hand, deck: { deckCard }, canIHaveThat: { round }, params: { rounds }, data: rawData, turn, ask }: HandlerData,
        responsesQueue: HandlerResponsesQueue<WantCardResponseMessage>,
    ): Promise<void> => {
        const data = reconcileDataAndHand(hand, rawData);

        const handWith = hand.slice();
        handWith.push(deckCard as Card);
        const message = ['Do you want', deckCard as Card];
        if (turn !== ask) {
            message.push('and an extra?');
        } else {
            message.push('?');
        }
        const [sent, received] = this.intermediary.form(
            { type: 'print', message: roundToString(rounds[round]) },
            { type: 'printCards', cards: data.hand },
            { type: 'confirm', message },
        );

        responsesQueue.push(
            received.then(([, orderedHand, want]) => {
                data.hand = orderedHand;
                return [new WantCardResponseMessage(want), data];
            }) as Promise<[WantCardResponseMessage, { [key: string]: Serializable }]>,
        );

        return sent;
    };

    handleTurn = async (gameState: HandlerData, responsesQueue: HandlerResponsesQueue<DiscardResponseMessage | GoDownResponseMessage | PlayResponseMessage>) => {
        gameState.data = reconcileDataAndHand(gameState.hand, gameState.data);
        await this.superTurn(
            gameState,
            responsesQueue.map(response => {
                switch (response.type) {
                    case 'discard-response':
                        return [new DiscardResponseMessage(response.toDiscard), gameState.data] as const;
                    case 'go-down-response':
                        return [new GoDownResponseMessage(response.toPlay), gameState.data] as const;
                    case 'play-response':
                        return [new PlayResponseMessage(response.playOn, response.toPlay, response.newMeld), gameState.data] as const;
                }
            }) as HandlerResponsesQueue<DiscardResponseMessage | GoDownResponseMessage | PlayResponseMessage>,
        );
    };

    async playOnOthers(hand: Card[], played: (ThreeCardSet | FourCardRun)[][], responsesQueue: HandlerResponsesQueue<PlayResponseMessage>, data: unknown) {
        while (hand.length && (await this.wantToPlay(played.reduce(flatten, []), hand, data))) {
            const runToPlayOn = await this.whichPlay(played.reduce(flatten, []), hand);
            await this.askToPlayOnRun(runToPlayOn, hand, responsesQueue, data);
        }
    }

    async selectCards(cardsLeft: Card[], num: 3 | 4): Promise<Card[]> {
        return (
            await this.intermediary.form({
                type: 'checkbox',
                message: ['Please enter cards in the ' + (num === 3 ? '3 of a kind' : '4 card run')],
                choices: cardsLeft.sort(Card.compare).map(card => ({ name: card.toString(), value: card })),
                validate: validateSelectCards,
                validateParam: { num },
            })[1]
        )[0] as Card[];
    }

    async cardsToPlay(_hand: Card[], run: Meld, data: any): Promise<Card[]> {
        return (
            await this.intermediary.form({
                type: 'checkbox',
                message: ["Please select cards you'd like to add"],
                choices: data.hand.map(toInquirerValue),
                validate: validateCardsToPlay,
                validateParam: { run: run as ThreeCardSet | FourCardRun },
            })[1]
        )[0] as Card[];
    }

    async moveToTop(): Promise<boolean> {
        return (
            await this.intermediary.form({
                type: 'confirm',
                message: ['Would you like to move the old card to the top'],
            })[1]
        )[0];
    }

    async wantToPlay(runOptions: Meld[], hand: Card[], data: any): Promise<boolean> {
        data = reconcileDataAndHand(hand, data);

        const [orderedHand, , wantTo] = await this.intermediary.form(
            {
                type: 'printCards',
                cards: data.hand,
            },
            {
                type: 'print',
                message: ['Others have played', runOptions as (ThreeCardSet | FourCardRun)[]],
            },
            {
                type: 'confirm',
                message: ['Would you like to play cards on runs'],
            },
        )[1];

        data.hand = orderedHand;

        return wantTo;
    }

    async whichPlay(runOptions: (ThreeCardSet | FourCardRun)[], _hand: Card[]): Promise<Meld> {
        return (
            await this.intermediary.form({
                type: 'list',
                message: ['Please choose which run you would like to play on'],
                choices: runOptions.map(toInquirerValue),
            })[1]
        )[0] as Meld;
    }

    async wantToGoDown(hand: Card[], data: any): Promise<boolean> {
        data = reconcileDataAndHand(hand, data);

        const [orderedHand, wantTo] = await this.intermediary.form(
            {
                type: 'printCards',
                cards: data.hand,
            },
            {
                type: 'confirm',
                message: ['Would you like to go down'],
            },
        )[1];

        data.hand = orderedHand;

        return wantTo;
    }

    async discardChoice(cardsLeft: Card[], live: Card[]): Promise<Card> {
        // TODO all cards are live what to do?
        return (
            await this.intermediary.form(
                {
                    type: 'print',
                    message: live.length ? ['The cards', live, 'are live'] : undefined,
                },
                {
                    type: 'list',
                    message: ['Select the card to discard'],
                    choices: cardsLeft
                        .filter(card => live.indexOf(card) === -1)
                        .sort(Card.compare)
                        .map(toInquirerValue),
                },
            )[1]
        )[1] as Card;
    }

    async insertWild(run: Card[], wild: Card): Promise<number> {
        return (
            await this.intermediary.form({
                type: 'place',
                message: ['Please insert your wild card'],
                choices: run.map(toInquirerValue),
                /*
                 * TODO something up here
                 * should support validate?
                 */
                placeholder: wild.toString(),
            })[1]
        )[0];
    }
}

function validateCardsToPlay(input: Card[], { run }: { run: Meld }): string | boolean | Promise<string | boolean> {
    if (!input || !input.length) {
        return true;
    }
    try {
        // TODO revisit
        if (run.runType === 3) {
            new ThreeCardSet([...run.cards, ...input]);
        } else {
            checkFourCardRunPossible([...run.cards, ...input]);
        }
    } catch (e: any) {
        return e.toString();
    }
    return true;
}

function validateSelectCards(input: Card[], { num }: { num: 3 | 4 }) {
    if (input.length === 0) {
        return true;
    }
    try {
        if (num === 3) {
            new ThreeCardSet(input);
        } else {
            // TODO need to pull in
            checkFourCardRunPossible(input);
        }
        return true;
    } catch (e: any) {
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
