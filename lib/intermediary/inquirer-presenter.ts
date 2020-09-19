import { Presenter, Serializable } from "./presenter";
import inquirer from "inquirer";
import { Message } from "../games/message";
import { Card } from "..";

inquirer.registerPrompt('selectLine', require('inquirer-select-line'));

/**
 * Prompts questions to the user using the Inquirer library
 */
export class InquirerPresenter implements Presenter {
    printCards(options: { cards: Card[]; }): () => Card[] | Promise<Card[]> {
        console.log('You have', Message.defaultTransformer(options.cards));
        return () => options.cards;
    }

    checkbox<T, ValidateParam>(options: { message: Serializable[]; type: string; choices: { name: string; value: T; }[]; validate?: (input: T[], validateParam: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam }) {
        return async () => (await inquirer.prompt([{
            ...options,
            // @ts-ignore
            validate: options.validate ? (input) => options.validate(input, options.validateParam) : undefined,
            message: Message.defaultTransformer(options.message),
            name: 'checkbox',
            type: 'checkbox'
        }])).checkbox;
    }

    list<T>(options: { message: Serializable[]; type: string; choices: { name: string; value: T; }[]; }) {
        return async () => (await inquirer.prompt([{
            ...options,
            message: Message.defaultTransformer(options.message),
            name: 'list',
            type: 'list'
        }])).list;
    }

    input<ValidateParam>(options: { message: Serializable[]; validate?: (input: string, param: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam; }) {
        return async () => (await inquirer.prompt([{
            ...options,
            // @ts-ignore
            validate: options.validate ? (input) => options.validate(input, options.validateParam) : undefined,
            message: Message.defaultTransformer(options.message),
            name: 'input',
            type: 'input'
        }])).input;
    }

    confirm(options: { message: Serializable[]; }) {
        return async () => (await inquirer.prompt([{
            ...options,
            message: Message.defaultTransformer(options.message),
            name: 'confirm',
            type: 'confirm'
        }])).confirm;
    }

    place<T, ValidateParam>(options: { message: Serializable[]; choices: { name: string; value: T; }[]; placeholder: string; validate?: (input: number, param: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam }) {
        return async () => (await inquirer.prompt([{
            ...options,
            // @ts-ignore
            validate: options.validate ? (input) => options.validate(input, options.validateParam) : undefined,
            message: Message.defaultTransformer(options.message),
            name: 'selectLine',
            type: 'selectLine'
        }])).selectLine;
    }

    print(options: { message: Serializable[] | undefined }) {
        return async () => {
            if(options.message) {
                console.log(Message.defaultTransformer(options.message));
            }
        }
    }
}