import inquirer from 'inquirer';
// @ts-ignore
import selectLine from 'inquirer-select-line';
import { Message } from '../messages/message';
import { Card } from '../cards/card';
import { Presenter } from './presenter';
import { Presentable } from './presentable';

inquirer.registerPrompt('selectLine', selectLine);

/**
 * Prompts questions to the user using the Inquirer library
 */
export class InquirerPresenter implements Presenter {
    printCards(options: { cards: Card[] }): () => Card[] | Promise<Card[]> {
        console.log('You have', Message.defaultTransformer(options.cards));
        return () => options.cards;
    }

    checkbox<T, ValidateParam>(options: { message: Presentable[]; type: string; choices: { name: string; value: T }[]; validate?: (input: T[], validateParam: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam }) {
        return async () => (await inquirer.prompt([{
            ...options,
            // @ts-ignore
            validate: options.validate ? (input) => options.validate(input, options.validateParam) : undefined,
            message: Message.defaultTransformer(options.message),
            name: 'checkbox',
            type: 'checkbox',
        }])).checkbox;
    }

    list<T>(options: { message: Presentable[]; type: string; choices: { name: string; value: T }[] }) {
        return async () => (await inquirer.prompt([{
            ...options,
            message: Message.defaultTransformer(options.message),
            name: 'list',
            type: 'list',
        }])).list;
    }

    input<ValidateParam>(options: { message: Presentable[]; validate?: (input: string, param: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam }) {
        return async () => (await inquirer.prompt([{
            ...options,
            // @ts-ignore
            validate: options.validate ? (input) => options.validate(input, options.validateParam) : undefined,
            message: Message.defaultTransformer(options.message),
            name: 'input',
            type: 'input',
        }])).input;
    }

    confirm(options: { message: Presentable[] }) {
        return async () => (await inquirer.prompt([{
            ...options,
            message: Message.defaultTransformer(options.message),
            name: 'confirm',
            type: 'confirm',
        }])).confirm;
    }

    place<T, ValidateParam>(options: { message: Presentable[]; choices: { name: string; value: T }[]; placeholder: string; validate?: (input: number, param: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam }) {
        return async () => (await inquirer.prompt([{
            ...options,
            // @ts-ignore
            validate: options.validate ? (input) => options.validate(input, options.validateParam) : undefined,
            message: Message.defaultTransformer(options.message),
            name: 'selectLine',
            type: 'selectLine',
        }])).selectLine;
    }

    print(options: { message: Presentable[] | undefined }) {
        return () => {
            if(options.message) {
                console.log(Message.defaultTransformer(options.message));
            }
        };
    }
}
