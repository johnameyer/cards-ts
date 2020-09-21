import { Handler } from "../handler";
import { HandlerData } from "../handler-data";
import { Card } from "../../cards/card";
import { Message } from "../../games/message";
import { Suit } from "../../cards/suit";
import { Rank } from "../../cards/rank";
import { Intermediary } from "../../intermediary/intermediary";

const QS = new Card(Suit.SPADES, Rank.QUEEN);

function compare(one: Card, two: Card): number {
    if (one.suit !== two.suit) {
        return Suit.compare(one.suit, two.suit);
    }
    return Rank.compare(one.rank, two.rank);
}

const toInquirerValue = <T extends {toString: () => string}>(t: T) => ({
    name: t.toString(),
    value: t,
});

export class IntermediaryHandler extends Handler {
    constructor(private intermediary: Intermediary) {
        super();
    }

    private name!: string;

    async pass({ hand, gameParams: { numToPass } }: HandlerData): Promise<[Card[], unknown?]> {
        return [(await this.intermediary.form({
            type: 'checkbox',
            message: ['Select the cards to pass'],
            choices: hand.sort(compare).map(toInquirerValue),
            // @ts-ignore
            validate: validatePass,
            validateParam: { numToPass }
        }))[0] as Card[]];
    }

    async turn({ hand, tricks, currentTrick, pointsTaken }: HandlerData): Promise<[Card, unknown?]> {
        let choices = hand;
        if(currentTrick.length > 0) {
            if(choices.some(card => card.suit === currentTrick[0].suit)) {
                choices = choices.filter(card => card.suit === currentTrick[0].suit);
            } else if(tricks === 0) {
                choices = choices.filter(card => card.suit !== Suit.HEARTS && !card.equals(QS));
            }
        } else if(pointsTaken.every(points => points === 0)) {
            choices = choices.filter(card => card.suit !== Suit.HEARTS);
        }
        return [(await this.intermediary.form({
            type: 'list',
            message: ['Select the card to play'],
            choices: choices.sort(compare).map(toInquirerValue)
        }))[0] as Card];
    }

    message(message: Message, data: HandlerData): void {
        this.intermediary.print(message.components);
    }

    waitingFor(who: string | undefined): void {
    }

    public async askForName() {
        const name = (await this.intermediary.form({
            type: 'input',
            message: ['What is your name?']
        }))[0];
        this.name = name;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }
}

function validatePass(cards: Card[], { numToPass }: { numToPass: number }) {
    return cards.length === numToPass ? true : 'Need to pass ' + numToPass + ' cards';
}