import { Handler } from "../handler";
import { HandlerData } from "../handler-data";
import { Card, Message, Intermediary } from "@cards-ts/core";

const toInquirerValue = <T extends {toString: () => string}>(t: T) => ({
    name: t.toString(),
    value: t,
});

export class IntermediaryHandler extends Handler {
    private name: string;

    constructor(private intermediary: Intermediary) {
        super();
    }

    async action({ hand, gameParams: { numToPass } }: HandlerData): Promise<[unknown, unknown?]> {
        /*
            Here you let the player make an action through the intermediary,
                which provides an interface to a series of form elements.
         */
        return [(await this.intermediary.form({
            type: 'checkbox',
            message: ['Action on these cards?'],
            choices: hand.map(toInquirerValue),
            // @ts-ignore
            validate: validatePass, // Serializable (e.g. toString()able) validation function
            validateParam: { numToPass } // Serializable data to be passed alongside to the function
        }))[0] as Card[]];
    }

    
    message(message: Message): void {
        this.intermediary.print(...message.components);
    }

    waitingFor(): void {
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