import { Card } from "../cards/card.js";
import { Rank } from "../cards/rank.js";
import { Suit } from "../cards/suit.js";
import { Serializable } from "../intermediary/serializable.js";

export type Cloner<T extends Serializable> = (value: unknown) => T;

export const cloneUndefined = (value: unknown) => undefined;

export const cloneOptional = <S extends Serializable>(cloner: Cloner<S>) => (value: unknown) => {
    if(value === undefined) {
        return value;
    }
    return cloner(value);
}

export const cloneString = (value: unknown) => String(value);

export const cloneNumber = (value: unknown) => Number(value);

export const cloneRank = Rank.fromObj;

export const cloneSuit = Suit.fromObj;

export const cloneCard = Card.fromObj;

export const cloneObject = <S extends Record<string, Serializable>>(cloner: {[key in keyof S]: Cloner<S[key]>}) => (value: unknown) => {
    if(typeof value !== 'object' || value === null) {
        throw Error();
    }
    return Object.fromEntries(
        Object.entries(cloner).map(
            // @ts-expect-error
            ([key, cloner]) => ([key, cloner(value[key as keyof S])])
        )
    ) as S;
}

export const cloneArray = <S extends Serializable>(cloner: Cloner<S>) => (value: unknown) => {
    if(typeof value !== 'object' || value === null) {
        throw Error();
    }
    if(!(Symbol.iterator in value)) {
        throw Error();
    }
    return Array.of(value).map(cloner);
}

// TODO merge with other validations i.e. has card??