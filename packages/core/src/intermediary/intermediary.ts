import { DisplayElement, DisplayElementCallReturn } from './display-element';
import { Presenter } from './presenter';
import { deserialize, Serializable } from "./serializable";

export type IntermediaryMapping<T extends Array<DisplayElement<keyof Presenter>>> = {
    [I in keyof T]: T[I] extends DisplayElement<infer Key> ? DisplayElementCallReturn<Key> : never
}

/**
 * Class that handles how material is presented to the end user
 */
export interface Intermediary {
    print(...printables: Serializable[]): [sent?: Promise<void>];

    form<T extends (DisplayElement<keyof Presenter>)[]>(...components: T): [sent: undefined | Promise<void>, received: Promise<IntermediaryMapping<T>>];
}

// consider using the indexes of things instead of actual value, and then use outer wrapper to transform into value (so data isn't serialized both ways)

export namespace Intermediary {
    export function serializeComponents(components: DisplayElement<keyof Presenter>[]) {
        return components.map(component => ({
            ...component,
            // @ts-ignore
            validate: component.validate ? component.validate.toString() : undefined
        }));
    }

    export function deserializeComponents(components: any[]) {
        return components.map(component => ({
            ...component,
            type: component.type,
            message: component.message ? deserialize(component.message) : undefined,
            cards: component.cards ? deserialize(component.cards) : undefined,
            // @ts-ignore
            choices: component.choices ? component.choices.map(({ name, value }) => ({ name, value: deserialize(value) })) : undefined,
            validate: component.validate ? new Function('return ' +component.validate)() : undefined,
            validateParam: component.validateParam ? Object.fromEntries(Object.entries<any>(component.validateParam).map(([key, value]) => [key, deserialize(value)])) : undefined
        }));
    }
}