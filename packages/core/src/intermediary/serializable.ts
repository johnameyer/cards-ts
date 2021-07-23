import { Card } from '../cards/card';
import { Deck } from '../cards/deck';
import { FourCardRun } from '../cards/four-card-run';
import { Rank } from '../cards/rank';
import { Suit } from '../cards/suit';
import { ThreeCardSet } from '../cards/three-card-set';
import { Presentable } from "./presentable";

export type Serializable = Presentable | Deck | Serializable[] | {
    [key: string]: Serializable;
} | undefined | null;

export type ReadonlySerializable = Presentable | Deck | readonly Serializable[] | {
    readonly [key: string]: Serializable;
} | undefined | null;

export type SerializableObject = { [key: string]: Serializable };

export const serialize = JSON.stringify;

export function deserialize(result: unknown): Serializable {
    if (result === undefined || result === null) {
        return undefined;
    }
    if (typeof result === 'number' || typeof result === 'string' || typeof result === 'boolean') {
        return result;
    }
    if (Array.isArray(result)) {
        return result.map(deserialize);
    }
    try {
        if(hasType(result)) {
            if(typeof result.type === 'string') {
                switch(result.type) {
                    // TODO eventually all these types should accept an unknown, but would be overly verbose until Typescript supports 'in' narrowing
                    case 'card':
                        return Card.fromObj(result);
                    case 'suit':
                        return Suit.fromObj(result);
                    case 'deck':
                        return Deck.fromObj(result);
                    case 'rank':
                        return Rank.fromObj(result);
                    case 'pair':
                        return ThreeCardSet.fromObj(result);
                    case 'straight':
                        return FourCardRun.fromObj(result);
                }
            }
        }
    } catch {}
    return Object.fromEntries(Object.entries(result as object).map(([key, value]) => [key, deserialize(value)]));
}

function hasType(t: unknown): t is { type: unknown } {
    // Bad workaround until Typescript supports 'in' narrowing - https://github.com/microsoft/TypeScript/issues/25720
    return (typeof t === 'object' && t && 'type' in t) as boolean;
}