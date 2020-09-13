import { Card } from "../cards/card";
import { Run } from "../cards/run";

/**
 * Parent class for any message to be delivered to handlers
 */
export class Message {
    /**
     * @param components the pieces a message could be made of
     */
    constructor(public readonly components: Message.Component[]) {

    }
}

export namespace Message {
    export type Component = string | number | Card | Run | Component[];

    export type Transformer = (components: Component[]) => string;

    export const defaultTransformer: Transformer = (components: Component[], joiner = ' ') => components.map(component => {
        // @ts-ignore
        if(component.map) {
            // @ts-ignore
            return defaultTransformer(component, ', ');
        }
        return component.toString();
    }).reduce((a: string, b: string) => a + joiner + b);
}