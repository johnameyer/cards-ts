import { DisplayElement, DisplayElementCallReturn } from "./display-element";
import { Presenter, Serializable } from "./presenter";
import { Intermediary } from "./intermediary";
import { Protocol } from "./protocol";

export class ProtocolIntermediary implements Intermediary {
    constructor(private readonly protocol: Protocol<'print' | 'form'>) {}
    print(...printables: Serializable[]): void {
        this.protocol.send('print', printables);
    }

    async form<T extends keyof Presenter>(first: DisplayElement<T>): Promise<[DisplayElementCallReturn<T>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>): Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>): Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>): Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>): Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>, DisplayElementCallReturn<X>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter, Y extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>, sixth: DisplayElement<Y>): Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>, DisplayElementCallReturn<X>, DisplayElementCallReturn<Y>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter, Y extends keyof Presenter, Z extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>, sixth: DisplayElement<Y>, seventh: DisplayElement<Z>): Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>, DisplayElementCallReturn<X>, DisplayElementCallReturn<Y>, DisplayElementCallReturn<Z>]>;
    async form(...components: DisplayElement<keyof Presenter>[]): Promise<DisplayElementCallReturn<keyof Presenter>[]> {
        const form = Intermediary.serializeComponents(components);
        const result = await this.protocol.sendAndReceive('form', form);
        const values = Intermediary.deserializeSerializable(result) as Serializable[];
        return values;
    }
}