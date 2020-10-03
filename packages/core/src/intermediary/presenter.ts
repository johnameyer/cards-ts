import { Card } from '../cards/card';
import { FourCardRun } from '../cards/four-card-run';
import { Meld } from '../cards/meld';
import { Rank } from '../cards/rank';
import { Suit } from '../cards/suit';
import { ThreeCardSet } from '../cards/three-card-set';

export type Serializable = Card | Rank | Suit | ThreeCardSet | FourCardRun | string | number | boolean | Serializable[] | {
    [key: string]: Serializable;
} | undefined;

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
    confirm(options: { message: Serializable[]; }): (() => boolean | Promise<boolean>);

    /**
     * Allow the user to select multiple or no options from a list
     *
     * The validator function passed must not use any closure variables to work properly over a serialized interface
     * @param options the options to pass
     */
    checkbox<T extends Serializable, ValidateParam extends Serializable = undefined>(options: { message: Serializable[]; choices: { name: string; value: T; }[]; validate?: (input: T[], param: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam }): (() => T[] | Promise<T[]>);

    /**
     * Allows a user to select from a list
     *
     * @param options the options to pass
     */
    list<T extends Serializable>(options: { message: Serializable[]; choices: { name: string; value: T; }[]; }): (() => T | Promise<T>);

    /**
     * Allow a user to input a text string of their choice
     *
     * The validator function passed must not use any closure variables to work properly over a serialized interface
     * @param options the options to pass
     */
    input<ValidateParam extends Serializable = undefined>(options: { message: Serializable[]; validate?: (input: string, param: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam; }): (() => string | Promise<string>);

    /**
     * Allow a user to decide wherein a list to place an item
     *
     * The validator function passed must not use any closure variables to work properly over a serialized interface
     * @param options the options to pass
     */
    place<T extends Serializable, ValidateParam extends Serializable = undefined>(options: { message: Serializable[]; choices: { name: string; value: T; }[]; placeholder: string; validate?: (input: number, param: ValidateParam) => true | string | Promise<true | string>; validateParam?: ValidateParam }):  (() => number | Promise<number>);
    print(options: {message: Serializable[] | undefined}): () => void;
}