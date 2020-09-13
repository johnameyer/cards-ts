import { Intermediary } from "./intermediary";
import inquirer from "inquirer";
import { Message } from "../games/message";
import { option } from "yargs";

inquirer.registerPrompt('selectLine', require('inquirer-select-line'));

export class InquirerIntermediary implements Intermediary {
    async checkbox<T>(options: { prelude?: Message.Component[][]; message: Message.Component[]; type: string; choices: { name: string; value: T; }[]; validate?: (input: T[]) => boolean | string | Promise<boolean | string>; }): Promise<T[]> {
        if(options.prelude) {
            for(const line of options.prelude) {
                console.log(Message.defaultTransformer(line));
            }
        }
        return (await inquirer.prompt([{
            ...options,
            message: Message.defaultTransformer(options.message),
            name: 'checkbox',
            type: 'checkbox'
        }])).checkbox;
    }

    async list<T>(options: { prelude?: Message.Component[][]; message: Message.Component[]; type: string; choices: { name: string; value: T; }[]; }): Promise<T> {
        if(options.prelude) {
            for(const line of options.prelude) {
                console.log(Message.defaultTransformer(line));
            }
        }
        return (await inquirer.prompt([{
            ...options,
            message: Message.defaultTransformer(options.message),
            name: 'list',
            type: 'list'
        }])).list;
    }

    async input(options: { prelude?: Message.Component[][]; message: Message.Component[]; }): Promise<string> {
        if(options.prelude) {
            for(const line of options.prelude) {
                console.log(Message.defaultTransformer(line));
            }
        }
        return (await inquirer.prompt([{
            ...options,
            message: Message.defaultTransformer(options.message),
            name: 'input',
            type: 'input'
        }])).input;
    }

    async confirm(options: { prelude?: Message.Component[][]; message: Message.Component[]; }): Promise<boolean> {
        if(options.prelude) {
            for(const line of options.prelude) {
                console.log(Message.defaultTransformer(line));
            }
        }
        return (await inquirer.prompt([{
            ...options,
            message: Message.defaultTransformer(options.message),
            name: 'confirm',
            type: 'confirm'
        }])).confirm;
    }

    async place<T>(options: { prelude?: Message.Component[][]; message: Message.Component[]; choices: { name: string; value: T; }[]; placeholder: string; }): Promise<number> {
        if(options.prelude) {
            for(const line of options.prelude) {
                console.log(Message.defaultTransformer(line));
            }
        }
        return (await inquirer.prompt([{
            ...options,
            message: Message.defaultTransformer(options.message),
            name: 'selectLine',
            type: 'selectLine'
        }])).selectLine;
    }

    print(message: Message.Component[]): void {
        console.log(message);
    }
}