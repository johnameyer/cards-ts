import { Presentable } from '../intermediary/presentable.js';
import { ReadonlySerializable } from '../intermediary/serializable.js';
import { isDefined } from '../util/is-defined.js';
import { isNonnull } from '../util/is-nonnull.js';
import { Cloner } from './cloners.js';

/**
 * Parent class for any message to be delivered to handlers
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

type MessagePayload = Presentable | MessagePayload[] | {
    [key: string]: MessagePayload
};

type KeyedPayload = {[key: string]: MessagePayload};

// export interface IMessage<Type extends string, T extends MessagePayload> {
//     readonly payload: ReadonlySerializable;

//     readonly type: string;

//     readonly components: Presentable[];
// }


// TODO wrap up in a 'value' attribute instead of using a mapped type?
// export type IMessage<Type extends string, T extends KeyedPayload> = {
//     [key in keyof T]: T[key];
// } & {
//     type: Type;

//     components: Presentable[];
// }

export type IMessage<Type extends string, T extends MessagePayload> = {
    // TODO readonlys?
    readonly type: Type;

    components: Presentable[];

    payload: T;
}

export interface MessageBuilder<Type extends string, Payload extends MessagePayload> {
    readonly type: Type;
    new(payload: Payload): IMessage<Type, Payload>;
}

// Output is unused - used only for typing in lieu of https://github.com/microsoft/TypeScript/issues/50715
export const props = <T extends MessagePayload> (): T => undefined as unknown as T;

export function buildUnvalidatedMessage<Type extends string, T extends MessagePayload>(type: Type, props: T, stringBuilder: (t: T) => Presentable[]): MessageBuilder<Type, T> {
    return buildValidatedMessage(type, props, value => value as T, stringBuilder);
}

export function buildValidatedMessage<Type extends string, T extends MessagePayload>(type: Type, props: T, cloner: Cloner<T>, stringBuilder: (t: T) => Presentable[]): MessageBuilder<Type, T> {
    const instance = class MessageInstance implements Message {
        public readonly type: Type = type;

        components: Presentable[];

        [key: string]: ReadonlySerializable;

        constructor(public payload: T) {
            this.components = stringBuilder(payload);

            this.payload = cloner(payload);

            Object.freeze(this);
        }
    };
    
    // @ts-expect-error
    instance.type = type;

    return instance as MessageBuilder<Type, T>;
}

export interface VoidMessageBuilder<Type extends string> {
    readonly type: Type;
    new(): Readonly<IMessage<Type, never>>;
}

// TODO merge into above?
export function buildEmptyMessage<Type extends string>(type: Type, stringBuilder: () => Presentable[]): VoidMessageBuilder<Type> {
    const instance = class MessageInstance {
        public readonly type: Type = type;

        components: Presentable[];

        [key: string]: ReadonlySerializable;

        constructor() {
            this.components = stringBuilder();

            Object.freeze(this);
        }
    };
    
    // @ts-expect-error
    instance.type = type;
    // @ts-expect-error
    return instance as MessageBuilder<Type, never>;
}

type ElementType<T extends any[]> = T extends (infer U)[] ? U : never;

// export function buildMessageUnion<T extends MessageBuilder<any, any>[]>(...t: [...T]): 
// // ElementType<T>['type']
// { [key in ElementType<T>['type']]: Extract<ElementType<T>, {type: key}> }
//  {
//     return {} as any;
// }

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
