import { Card } from '../cards/card.js';
import { Serializable } from './serializable.js';
import { Presentable } from './presentable.js';

/**
 * Interface describing the different forms of questions that can be posed to the user over a variety of mediums
 */
export interface Presenter {
    /**
     * Show the user their hand (and allow them to rearrange in relevant contexts)
     * @param options options the options to pass
     */
    printCards(options: { cards: Card[] }): (() => Card[] | Promise<Card[]>);

    /**
     * Prompt the user a simple yes/no question
     * @param options the options to pass
     */
    confirm(options: { message: Presentable[] }): (() => boolean | Promise<boolean>);

    /**
     * Allow the user to select multiple or no options from a list
     *
     * The validator function passed must not use any closure variables to work properly over a serialized interface
     * @param options the options to pass
     */
    checkbox<T extends Presentable, ValidateParam extends Serializable = undefined>(options: { message: Presentable[]; choices: { name: string; value: T }[]; validate?: (input: T[], param: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam }): (() => T[] | Promise<T[]>);

    /**
     * Allows a user to select from a list
     *
     * @param options the options to pass
     */
    list<T extends Presentable>(options: { message: Presentable[]; choices: { name: string; value: T }[] }): (() => T | Promise<T>);

    /**
     * Allow a user to input a text string of their choice
     *
     * The validator function passed must not use any closure variables to work properly over a serialized interface
     * @param options the options to pass
     */
    input<ValidateParam extends Serializable = undefined>(options: { message: Presentable[]; validate?: (input: string, param: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam }): (() => string | Promise<string>);

    /**
     * Allow a user to decide wherein a list to place an item
     *
     * The validator function passed must not use any closure variables to work properly over a serialized interface
     * @param options the options to pass
     */
    place<T extends Presentable, ValidateParam extends Serializable = undefined>(options: { message: Presentable[]; choices: { name: string; value: T }[]; placeholder: string; validate?: (input: number, param: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam }): (() => number | Promise<number>);
    
    /**
     * Print a message or list of serializables
     * 
     * @param options the options to pass
     */
    print(options: {message: Presentable[] | undefined}): () => void;
}
