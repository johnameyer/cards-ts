import { Presentable } from "../intermediary/presentable";
import { Serializable } from "../intermediary/serializable";
import { isDefined } from '../util/is-defined';
import { isNonnull } from "../util/is-nonnull";

/**
 * Parent class for any message to be delivered to handlers
 */
export abstract class Message {
    readonly [key: string]: Serializable;

    public readonly type!: string;

    /**
     * @param components the pieces a message could be made of
     */
    protected constructor(public readonly components: Presentable[]) { }
}

export namespace Message {
    export type Transformer = (components: Presentable[], separator?: string) => string;

    export const defaultTransformer: Transformer = (components: Presentable[], joiner = ' ') => components.length ? components.map(component => {
        if(component === undefined) {
            return undefined;
        }
        if(component === null) {
            // TODO think about null here
            return null;
        }
        // @ts-ignore
        if(component.map) {
            // @ts-ignore
            return defaultTransformer(component, ', ');
        }
        return component.toString();
    }).filter(isDefined).filter(isNonnull).reduce((a: string, b: string) => a + joiner + b) : '';
}