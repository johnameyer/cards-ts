import { Card } from '../cards/card.js';
import { Deck } from '../cards/deck.js';
import { FourCardRun } from '../cards/four-card-run.js';
import { Rank } from '../cards/rank.js';
import { Suit } from '../cards/suit.js';
import { ThreeCardSet } from '../cards/three-card-set.js';
import { Presentable } from './presentable.js';

/**
 * Things that the library knows how to serialize and deserialize
 */
export type Serializable = Presentable | Deck | Serializable[] | {
    [key: string]: Serializable;
} | undefined | null;

export type ReadonlySerializable = Presentable | Deck | readonly Serializable[] | {
    readonly [key: string]: Serializable;
} | undefined | null;

export type SerializableObject = { [key: string]: Serializable };

/**
 * Writes a value to a string
 * @param value the value to write to a string
 * @returns the value as a string
 */
export const serialize = (value: Serializable): string => value === undefined ? 'undefined' : JSON.stringify(value);

/**
 * Deserializes from a string
 * @param str the value as a string
 * @returns the deserialized object
 */
export function deserialize(str: string): Serializable {
    if(str === 'undefined') {
        return undefined;
    }
    const result: unknown = JSON.parse(str);
    return reconstruct(result);
}

/**
 * Creates serializable objects out of plain object values
 */
export function reconstruct(result: unknown): Serializable {
    if(result === undefined || result === null) {
        return undefined;
    }
    if(typeof result === 'number' || typeof result === 'string' || typeof result === 'boolean') {
        return result;
    }
    if(Array.isArray(result)) {
        return result.map(reconstruct);
    }
    try {
        if(hasType(result)) {
            if(typeof result.type === 'string') {
                switch (result.type) {
                // TODO eventually all these types should accept an unknown, but would be overly verbose until Typescript supports 'in' narrowing
                case 'card':
                    return Card.fromObj(result);
                case 'suit':
                    return Suit.fromObj(result);
                case 'deck':
                    return Deck.fromObj(result);
                case 'rank':
                    return Rank.fromObj(result);
                case 'set':
                    return ThreeCardSet.fromObj(result);
                case 'straight':
                    return FourCardRun.fromObj(result);
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
    return Object.fromEntries(Object.entries(result as Record<string, unknown>).map(([ key, value ]) => [ key, reconstruct(value) ]));
}

function hasType(t: unknown): t is { type: unknown } {
    // Bad workaround until Typescript supports 'in' narrowing - https://github.com/microsoft/TypeScript/issues/25720
    return (typeof t === 'object' && t && 'type' in t) as boolean;
}
