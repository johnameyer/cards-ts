import { Card } from "../cards/card.js";
import { FourCardRun } from "../cards/four-card-run.js";
import { Meld } from "../cards/meld.js";
import { Rank } from "../cards/rank.js";
import { Suit } from "../cards/suit.js";
import { ThreeCardSet } from "../cards/three-card-set.js";
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

export const cloneMeld = (value: unknown): Meld => {
    if(typeof value === 'object' && value !== null && 'type' in value) {
        switch(value.type) {
            case 'set':
                return ThreeCardSet.fromObj(value);
            case 'straight':
                return FourCardRun.fromObj(value);
        }
    }
    throw Error();
};

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
    if(!Array.isArray(value)) {
        throw Error();
    }
    return Array.from(value).map(cloner);
}
