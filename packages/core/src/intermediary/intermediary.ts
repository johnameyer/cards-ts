import { Card } from '../cards/card';
import { FourCardRun } from '../cards/four-card-run';
import { Rank } from '../cards/rank';
import { Suit } from '../cards/suit';
import { ThreeCardSet } from '../cards/three-card-set';
import { DisplayElement, DisplayElementCallReturn } from './display-element';
import { Serializable, Presenter } from './presenter';

/**
 * Class that handles how material is presented to the end user
 */
export interface Intermediary {
    print(...printables: Serializable[]): [sent?: Promise<void>];

    form<T extends keyof Presenter>(first: DisplayElement<T>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>]>];
    form<T extends keyof Presenter, U extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>]>];
    form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>]>];
    form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>]>];
    form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>, DisplayElementCallReturn<X>]>];
    form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter, Y extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>, sixth: DisplayElement<Y>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>, DisplayElementCallReturn<X>, DisplayElementCallReturn<Y>]>];
    form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter, Y extends keyof Presenter, Z extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>, sixth: DisplayElement<Y>, seventh: DisplayElement<Z>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>, DisplayElementCallReturn<X>, DisplayElementCallReturn<Y>, DisplayElementCallReturn<Z>]>];
    form(...components: DisplayElement<keyof Presenter>[]): [sent: undefined | Promise<void>, received: Promise<DisplayElementCallReturn<keyof Presenter>[]>];
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
            message: component.message ? deserializeSerializable(component.message) : undefined,
            cards: component.cards ? deserializeSerializable(component.cards) : undefined,
            // @ts-ignore
            choices: component.choices ? component.choices.map(({ name, value }) => ({ name, value: deserializeSerializable(value) })) : undefined,
            validate: component.validate ? new Function('return ' +component.validate)() : undefined,
            validateParam: component.validateParam ? Object.fromEntries(Object.entries<any>(component.validateParam).map(([key, value]) => [key, deserializeSerializable(value)])) : undefined
        }));
    }

    export function deserializeSerializable(result: Serializable): Serializable {
        if (result === undefined || result === null) {
            return undefined;
        }
        if (typeof result === 'number' || typeof result === 'string' || typeof result === 'boolean') {
            return result;
        }
        if (Array.isArray(result)) {
            return result.map(deserializeSerializable);
        }
        try {
            if(typeof result.type === 'string') {
                switch(result.type) {
                    case 'card':
                        return Card.fromObj(result);
                    case 'suit':
                        return Suit.fromObj(result);
                    case 'rank':
                        return Rank.fromObj(result);
                    case 'pair':
                        return ThreeCardSet.fromObj(result);
                    case 'straight':
                        return FourCardRun.fromObj(result);
                }
            }
        } catch {}
        return Object.fromEntries(Object.entries(result).map(([key, value]) => [key, deserializeSerializable(value)]));
    }
}