import { Serializable } from "../intermediary/presenter";
import { isDefined } from "../util/is-defined";

/**
 * Parent class for any message to be delivered to handlers
 */
export abstract class Message {
    public readonly type!: string;

    /**
     * @param components the pieces a message could be made of
     */
    protected constructor(public readonly components: Serializable[]) { }
}

export namespace Message {
    export type Transformer = (components: Serializable[], separator?: string) => string;

    export const defaultTransformer: Transformer = (components: Serializable[], joiner = ' ') => components.map(component => {
        if(component === undefined) {
            return undefined;
        }
        // @ts-ignore
        if(component.map) {
            // @ts-ignore
            return defaultTransformer(component, ', ');
        }
        return component.toString();
    }).filter(isDefined).reduce((a: string, b: string) => a + joiner + b);
}