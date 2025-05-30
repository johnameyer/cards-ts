import { Presentable } from '../intermediary/presentable.js';
import { ReadonlySerializable } from '../intermediary/serializable.js';
import { isDefined } from '../util/is-defined.js';
import { isNonnull } from '../util/is-nonnull.js';

/**
 * A serializable object designating a change in the game state.
 * {@include ../../../../wiki/glossary.md#message}
 * @category Message
 */
export abstract class Message {
    readonly [key: string]: ReadonlySerializable;

    public abstract readonly type: string;

    /**
     * @param components the pieces a message could be made of
     */
    protected constructor(public readonly components: Presentable[]) { }
}

/**
 * @category Message
 */
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
        if(Array.isArray(component)) {
            return defaultTransformer(component, ', ');
        }
        return component.toString();
    }).filter(isDefined)
        .filter(isNonnull)
        .join(joiner) : '';
}
