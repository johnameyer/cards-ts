import { Message } from "../games/message";

export interface Intermediary {
    confirm(options: { prelude?: Message.Component[][]; message: Message.Component[]; }): boolean | PromiseLike<boolean>;
    checkbox<T>(options: { prelude?: Message.Component[][]; message: Message.Component[]; choices: { name: string; value: T; }[]; validate?: (input: T[]) => boolean | string | Promise<boolean | string>; }): Promise<T[]>;
    list<T>(options: { prelude?: Message.Component[][]; message: Message.Component[]; choices: { name: string; value: T; }[]; }): Promise<T>;
    input(options: { prelude?: Message.Component[][]; message: Message.Component[] }): Promise<string>;
    place<T>(options: { prelude?: Message.Component[][]; message: Message.Component[]; choices: { name: string; value: T; }[]; placeholder: string; }): Promise<number>;
    print(message: Message.Component[]): void;
}